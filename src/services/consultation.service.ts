import { db } from "@/db";
import { consultationQueries } from "@/db/queries/consultation.queries";
import { joinedQueries } from "@/db/queries/joined.queries";
import { DuplicateError } from "@/errors";
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
