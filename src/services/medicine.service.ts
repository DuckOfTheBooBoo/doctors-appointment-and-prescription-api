import { db } from "@/db";
import { Medicine } from "@/models/medicine.model";
import { type ResultSetHeader } from "mysql2/promise";

export async function addMedicineService(input: { name: string; stock: number }): Promise<Medicine> {
    const { name, stock } = input;
    const insertQuery = `INSERT INTO medicines (name, stock) VALUES (?,?)`;
    try {
        const result = await db.execute(insertQuery, [name, stock]);
        const insertId = (result as ResultSetHeader).insertId;
        return new Medicine(insertId, name, stock);
    } catch (error) {
        throw error;
    }
}
