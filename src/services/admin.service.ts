import { db } from "@/db";
import { joinedQueries } from "@/db/queries/joined.queries";
import { MedicalProfessional } from "@/models/medicalProfessional.model";
import { PendingRegistrations } from "@/models/pendingRegistrations.model";
import { User } from "@/models/user.model";
import { RowDataPacket } from "mysql2";

interface PendingRegistrationsRow extends RowDataPacket {
    id: number;
    prefix: string | null;
    suffix: string | null;
    first_name: string;
    last_name: string | null;
    date_of_birth: Date;
    gender: "M" | "F";
    phone: string;
    email: string | null;
    address: string;
    is_active: boolean;
    created_at: Date;
    role: "doctor" | "pharmacist";
    specialization: string | null;
    work_status: "pending" | "active" | "inactive";
    license_id: number;
    number: number;
    issuing_authority: string;
    issue_date: Date;
    expiry_date: Date;
    license_status: "active" | "inactive";
    specialty: string | null;
}

export async function pendingRegistrationsService(): Promise<PendingRegistrations[]> {
    try {
        const pendingRegistrations: PendingRegistrations[] = [];
        const rows = await db.query<PendingRegistrationsRow[]>(joinedQueries.getAllPendingRegistrations);
        
        rows.forEach(pd => {
            const md = new MedicalProfessional(pd.id, pd.prefix, pd.suffix, pd.first_name, pd.last_name, pd.date_of_birth, pd.gender, pd.phone, null, null, pd.address, pd.is_active, pd.created_at, pd.created_at, pd.role, pd.specialization);
        })

        return pendingRegistrations;
    } catch (error) {
        throw error;
    }
}