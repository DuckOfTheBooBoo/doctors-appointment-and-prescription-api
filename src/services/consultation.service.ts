import { db } from "@/db";
import { consultationQueries } from "@/db/queries/consultation.queries";
import { joinedQueries } from "@/db/queries/joined.queries";
import { prescriptionQueries } from "@/db/queries/prescription.queries";
import { medicineQueries } from "@/db/queries/medicine.queries";
import { DuplicateError, InsufficientAuthorizationError, InsufficientStockError, NotFoundError } from "@/errors";
import { Consultation } from "@/models/consultation.model";
import { type ResultSetHeader } from "mysql2/promise";

export async function createConsultationService(input: { user_id: number, schedule_id: number }): Promise<Consultation> {
    const { user_id, schedule_id } = input;
    const bookedAt: Date = new Date();

    try {
        const check = await db.query(joinedQueries.getConsultationsByScheduleId, [schedule_id, user_id]);
        if (check.length > 0) {
            throw new DuplicateError("You already have booked this schedule.")
        }
        
        const result = await db.execute(consultationQueries.create, [user_id, schedule_id, bookedAt]);
        const insertId = (result as ResultSetHeader).insertId;
        return new Consultation(insertId, user_id, schedule_id, bookedAt, null);
    } catch (error) {
        throw error;
    }
}

// New interface for prescription item input
interface PrescriptionItemInput {
    id: number;
    dosage: string;
    frequency: string;
    duration: string;
    note?: string;
}

export async function createPrescriptionService(
    doctorId: number,
    consultationId: number,
    body: { note: string; medicines: PrescriptionItemInput[] }
): Promise<{ prescriptionId: number }> {

    // Check if the doctor is authorized to make consultation's summary
    const consultationRows = await db.query<any[]>(joinedQueries.getConsultationWithIdAndDoctorId, [consultationId, doctorId]);
    
    if (consultationRows.length === 0) {
        throw new InsufficientAuthorizationError("You're not authorized to make consultation's summary.")
    }
    

    // Check each medicine stock
    for (const item of body.medicines) {
        const rows = await db.query<any[]>(medicineQueries.getById, [item.id]);
        const medicine = rows[0];
        if (!medicine) {
            throw new NotFoundError(`Medicine with id of ${item.id} is not found.`)
        }

        if (medicine.stock === 0) {
            throw new InsufficientStockError(`Medicine ${medicine.name} with id ${item.id} is out of stock`);
        }
    }
    try {
        return await db.transaction(async (connection) => {
            // Update consultation record with note
            await connection.execute(prescriptionQueries.updateConsultationNote, [body.note, consultationId]);
            // Create prescription record
            const [presResult] = await connection.execute<ResultSetHeader>(prescriptionQueries.createPrescription, [consultationId]);
            const prescriptionId = presResult.insertId;
            // For each medicine: insert prescription item and decrease stock
            for (const item of body.medicines) {
                await connection.execute(prescriptionQueries.createPrescriptionItem, [
                    prescriptionId,
                    item.id,
                    item.dosage,
                    item.frequency,
                    item.duration,
                    item.note
                ]);
                const stockRes = await connection.execute(medicineQueries.decreaseStock, [item.id]);
                const header = stockRes as any;
                if (header.affectedRows === 0) {
                    throw new InsufficientStockError(`Failed to decrease stock for medicine id ${item.id}`);
                }
            }
            return { prescriptionId };
        });
    } catch (error) {
        throw error;
    }
}
