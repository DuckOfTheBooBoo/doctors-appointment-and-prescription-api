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
        // Inisialisasi array untuk menyimpan objek MedicalProfessional
        const pendingRegistrations: MedicalProfessional[] = [];
        // Eksekusi query untuk mendapatkan semua pending registrations
        const rows = await db.query<PendingRegistrationsRow[]>(joinedQueries.getAllPendingRegistrations);
        
        // Iterasi setiap baris dan mapping ke objek MedicalProfessional
        rows.forEach(pd => {
            // Membuat instance License dengan data dari query
            const license = new License({
                id: pd.license_id,
                number: pd.number,
                issuing_authority: pd.issuing_authority,
                issue_date: pd.issue_date,
                expiry_date: pd.expiry_date,
                status: pd.license_status,
                specialty: pd.specialty
            } as LicenseInput);
            // Membuat instance MedicalProfessional dengan data dari query
            const md = new MedicalProfessional(
                pd.id, pd.prefix, pd.suffix, pd.first_name, pd.last_name, pd.date_of_birth,
                pd.gender, pd.phone, null, null, pd.address, pd.is_active, pd.created_at, pd.created_at,
                pd.role, pd.specialization, license
            );
            pendingRegistrations.push(md);
        });
        // Mengembalikan array yang telah terisi
        return pendingRegistrations;
    } catch (error) {
        // Melempar error jika terjadi kesalahan
        throw error;
    }
}