// Mengimpor koneksi database
import { db } from "@/db";
// Mengimpor query joined untuk mengambil pending registrations
import { joinedQueries } from "@/db/queries/joined.queries";
// Mengimpor model License
import { License } from "@/models/license.model";
// Mengimpor model MedicalProfessional
import { MedicalProfessional } from "@/models/medicalProfessional.model";
// Mengimpor tipe LicenseInput
import { LicenseInput } from "@/types/common";
// Mengimpor RowDataPacket dari mysql2
import { RowDataPacket } from "mysql2";
// Untuk hash password
import bcrypt from "bcrypt";

// Mendefinisikan interface PendingRegistrationsRow untuk tipe baris dari query
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
    number: string;
    issuing_authority: string;
    issue_date: Date;
    expiry_date: Date;
    license_status: "active" | "inactive";
    specialty: string | null;
}

// Fungsi untuk mengambil semua registrasi pending
export async function pendingRegistrationsService(): Promise<MedicalProfessional[]> {
    try {
        const pendingRegistrations: MedicalProfessional[] = [];
        const rows = await db.query<PendingRegistrationsRow[]>(joinedQueries.getAllPendingRegistrations);

        rows.forEach(pd => {
            const license = new License({
                id: pd.license_id,
                number: pd.number,
                issuing_authority: pd.issuing_authority,
                issue_date: pd.issue_date,
                expiry_date: pd.expiry_date,
                status: pd.license_status,
                specialty: pd.specialty
            } as LicenseInput);

            const md = new MedicalProfessional(
                pd.id, pd.prefix, pd.suffix, pd.first_name, pd.last_name, pd.date_of_birth,
                pd.gender, pd.phone, null, null, pd.address, pd.is_active, pd.created_at, pd.created_at,
                pd.role, pd.specialization, license
            );

            pendingRegistrations.push(md);
        });

        return pendingRegistrations;
    } catch (error) {
        throw error;
    }
}

// Fungsi untuk approve user (update work_status dan set password)
export async function approveInvitationService(invitationId: number, password: string): Promise<void> {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const updateQuery = `
            UPDATE users 
            SET work_status = 'active', password = ? 
            WHERE id = ?
        `;
        await db.execute(updateQuery, [hashedPassword, invitationId]);
    } catch (error) {
        throw error;
    }
}
