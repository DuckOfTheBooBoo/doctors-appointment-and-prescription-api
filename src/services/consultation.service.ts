import { db } from "@/db";
import { consultationQueries } from "@/db/queries/consultation.queries";
import { joinedQueries } from "@/db/queries/joined.queries";
import { prescriptionQueries } from "@/db/queries/prescription.queries";
import { medicineQueries } from "@/db/queries/medicine.queries";
import { DuplicateError, InsufficientAuthorizationError, InsufficientStockError, NotFoundError } from "@/errors";
import { Consultation } from "@/models/consultation.model";
import { type RowDataPacket, type ResultSetHeader } from "mysql2/promise";
import { Prescription } from "@/models/prescription.model";
import { PrescriptionItem } from "@/models/prescription_item.model";

interface ConsultationQuery extends RowDataPacket {
    id: number;
    schedule_id: number;
    booked_at: Date;
    note: string | null;
    user_id: number;
    doctor_id: number;
}

interface PrescriptionWithItemsQuery extends RowDataPacket {
    issued_at: Date;
    prescription_id: number;
    medicine_id: number;
    dosage: string;
    frequency: string;
    duration: string;
    notes: string | null;
}

export async function getConsultation(consultationId: number, userId: number, role: string): Promise<Consultation> {
    try {
        // For patients
        const userArgs: any[] = [consultationId, userId, null];
        // For doctors
        const doctorArgs: any[] = [consultationId, null, userId];
        const args: any[] = role === 'patient' ? userArgs : role === 'doctor' ? doctorArgs : [];

        // Empty array suggest that the role is neither patient nor doctor
        if (!args) {
            throw new InsufficientAuthorizationError("You're not authorized to make this request");
        }

        const result = await db.query<ConsultationQuery[]>(consultationQueries.getByIdAndUserId, args);

        if (result.length === 0) {
            throw new NotFoundError("Consultation not found");
        }

        
        const consultationRow: ConsultationQuery = result[0];
        const consultation: Consultation = new Consultation(consultationRow.id, consultationRow.user_id, consultationRow.schedule_id, consultationRow.booked_at, consultationRow.note);
        // Get prescription ;
        const prescriptionResult = await db.query<PrescriptionWithItemsQuery[]>(prescriptionQueries.getPrescriptionItemsByConsultationId, [consultation.id]);

        let prescription: Prescription | null = null;
        if (prescriptionResult.length > 0) {
            const items: PrescriptionItem[] = prescriptionResult.map(pres => new PrescriptionItem(pres.prescription_id, pres.medicine_id, pres.dosage, pres.frequency, pres.duration, pres.notes));
            prescription = new Prescription(prescriptionResult[0].prescription_id, items, prescriptionResult[0].issued_at);
        }        

        consultation.prescription = prescription;

        return consultation;
    } catch (error) {
        throw error;
    }
}

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
