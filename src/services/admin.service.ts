// Mengimpor koneksi database
import { db } from "@/db";
// Mengimpor query joined untuk mengambil pending registrations
import { joinedQueries } from "@/db/queries/joined.queries";
import { NotFoundError } from "@/errors";
// Mengimpor model License
import { License } from "@/models/license.model";
// Mengimpor model MedicalProfessional
import { MedicalProfessional } from "@/models/medicalProfessional.model";
// Mengimpor tipe LicenseInput
import { LicenseInput } from "@/types/common";
import { generateToken } from "@/utils/tokenGenerator";
// Mengimpor RowDataPacket dari mysql2
import { RowDataPacket } from "mysql2";

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
export async function approveInvitationService(userId: number): Promise<{ user_id: number, token: string, endpoint: string }> {
    try {
        // 1. Cek apakah user_id ada di table users
            const userQuery = `SELECT * FROM users WHERE id = ?`;
            const userRows = await db.execute(userQuery, [userId]);

            // Cek apakah data ditemukan
            if ((userRows as unknown as RowDataPacket[]).length === 0) {
            throw new NotFoundError("User doesn't exist");
            }

        // 2. Jika ada, buat token dengan memanggil fungsi generateToken()
        const token = generateToken(userId);

        // 3. Setelah token dibuat, masukkan user_id dan token ke table user_invitations dengan db.execute
        const insertQuery = `INSERT INTO user_invitations (user_id, token) VALUES (?, ?)`;
        await db.execute(insertQuery, [userId, token]);

        // 4. Return data yang sudah dibuat ke controller dengan format
        return {
            user_id: userId,
            token: token,
            endpoint: `auth/set-password?token=${token}`
        };
    } catch (error) {
        throw error;
    }
}
