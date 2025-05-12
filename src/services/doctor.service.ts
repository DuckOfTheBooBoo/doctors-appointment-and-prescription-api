// Mengimpor koneksi database
import { db } from "@/db";
// Mengimpor query license
import { licenseQueries } from "@/db/queries/license.queries";
// Mengimpor query medical professionals
import { medicalProfessionalsQueries } from "@/db/queries/medicalProfessionals.queries";
// Mengimpor query user
import { userQueries } from "@/db/queries/user.queries";
// Mengimpor model License
import { License } from "@/models/license.model";
// Mengimpor model MedicalProfessional
import { MedicalProfessional } from "@/models/medicalProfessional.model";
// Mengimpor tipe input DoctorInput dari "@/types/common"
import { DoctorInput } from "@/types/common";
// Mengimpor tipe ResultSetHeader dan PoolConnection
import { type ResultSetHeader, type PoolConnection, RowDataPacket } from "mysql2/promise";

// Fungsi untuk membuat doctor baru
export async function createDoctorService(body: DoctorInput): Promise<MedicalProfessional> {
    // Destruktur properti yang diperlukan dari body
    const { prefix, suffix, first_name, last_name, date_of_birth, gender, phone, email, address } = body;
    // Membuat instance License baru untuk doctor
    const newLicense = new License(body.license);
    // Membuat instance MedicalProfessional baru dengan role "doctor" dan spesialisasi
    const newDoctor = new MedicalProfessional(
        null,
        prefix,
        suffix,
        first_name,
        last_name,
        date_of_birth,
        gender,
        phone,
        email,
        null,
        address,
        false,
        new Date(),
        new Date(),
        "doctor",
        body.specialization,
        newLicense
    );

    try {
        // Memulai transaksi database
        await db.transaction(async (connection: PoolConnection) => {

            // Membuat record user untuk doctor
            const [userRes] = await connection.execute<ResultSetHeader>(userQueries.create, [
                newDoctor.prefix,
                newDoctor.suffix,
                newDoctor.firstName,
                newDoctor.lastName,
                newDoctor.dateOfBirth,
                newDoctor.gender,
                newDoctor.phone,
                null,
                null,
                newDoctor.address,
                false
            ]);
            // Update id doctor dari hasil insert ke table user
            newDoctor.id = userRes.insertId;
    
            // Membuat record license untuk doctor
            const [licenseRes] = await connection.execute<ResultSetHeader>(licenseQueries.create, [
                newLicense.number,
                newLicense.issuingAuthority,
                newLicense.issueDate,
                newLicense.expiryDate,
                newLicense.specialty
            ]);
            // Update id license pada objek doctor
            newDoctor.license.id = licenseRes.insertId;
    
            // Membuat record medical professional untuk doctor
            await connection.execute<ResultSetHeader>(medicalProfessionalsQueries.create, [
                newDoctor.id,
                newDoctor.role,
                newDoctor.specialization,
                newDoctor.license.id,
                'pending'
            ]);
            
            return true;
        });
        // Mengembalikan objek doctor yang baru dibuat
        return newDoctor;
    } catch (error) {
        // Melempar ulang error jika terjadi kesalahan
        throw error;
    }
}

interface DoctorsQuery extends RowDataPacket {
    id: number;
    prefix: string | null;
    suffix: string | null;
    first_name: string;
    last_name: string | null;
    specialization: string;
}

// Fungsi untuk mendapatkan daftar doctors dengan pagination
export async function getDoctorsService(page: number, limit: number, specialty: string | null = null) {
    const offset = (page - 1) * limit;

    try {
        const rows = await db.query<DoctorsQuery[]>(medicalProfessionalsQueries.getDoctors, [specialty, limit, offset]);
        return rows;
    } catch (error) {
        throw error;
    }
}