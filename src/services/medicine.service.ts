import { db } from "@/db";
import { medicineQueries } from "@/db/queries/medicine.queries";
import { InsufficientAuthorizationError, NotFoundError } from "@/errors";
import { Medicine } from "@/models/medicine.model";
import { MySQLError } from "@/types/common";
import { RowDataPacket, type ResultSetHeader } from "mysql2/promise";

export async function addMedicineService(input: { name: string; stock: number }): Promise<Medicine> {
    const { name, stock } = input;
    try {
        const result = await db.execute(medicineQueries.create, [name, stock]);
        const insertId = (result as ResultSetHeader).insertId;
        return new Medicine(insertId, name, stock);
    } catch (error) {
        throw error;
    }
}

interface MedicineRow extends RowDataPacket {
    id: number;
    name: string;
    stock: number;
}

export async function updateMedicineStockService(id: number, newStock: number): Promise<Medicine> {
	try {
		await db.execute(medicineQueries.updateStock, [newStock, id]);
		// Fetch the updated record
		const rows = await db.query<MedicineRow[]>(medicineQueries.getById, [id]);
		// Assuming rows is an array and the first element is the result row
		const record = rows[0];
		if (!record) throw new NotFoundError("Medicine not found");
		return new Medicine(record.id, record.name, record.stock);
	} catch (error) {
		throw error;
	}
}

export async function deleteMedicineService(id: number): Promise<void> {
    try {
        await db.execute(medicineQueries.delete, [id]);
        return;
    } catch (error) {

        const err = error as MySQLError;
        // Jika error merupakan ER_ROW_IS_REFERENCED_2 (errno 1451), lempar InsufficientAuthorizationError
        if (err.errno && err.errno === 1451) {
            throw new InsufficientAuthorizationError("Failed to delete medicine. Medicine is referenced in a prescription.");
        }

        console.error(error);
        throw error;
    }
}
