// Mengimpor koneksi database dari "@/db"
import { db } from "@/db";
// Mengimpor query license dari "@/db/queries/license.queries"
import { licenseQueries } from "@/db/queries/license.queries";
// Mengimpor query medical professional dari "@/db/queries/medicalProfessionals.queries"
import { medicalProfessionalsQueries } from "@/db/queries/medicalProfessionals.queries";
// Mengimpor query user dari "@/db/queries/user.queries"
import { userQueries } from "@/db/queries/user.queries";
// Mengimpor model License dari "@/models/license.model"
import { License } from "@/models/license.model";
// Mengimpor model MedicalProfessional dari "@/models/medicalProfessional.model"
import { MedicalProfessional } from "@/models/medicalProfessional.model";
// Mengimpor tipe input untuk pharmacist dari "@/types/common"
import { type PharmacistInput } from "@/types/common";
// Mengimpor tipe ResultSetHeader dan PoolConnection dari mysql2/promise
import { type ResultSetHeader, type PoolConnection } from "mysql2/promise";

// Fungsi service untuk membuat pharmacist baru
export async function createPharmacistService(body: PharmacistInput): Promise<MedicalProfessional> {
    // Destruktur properti yang diperlukan dari body
    const { prefix, suffix, first_name, last_name, date_of_birth, gender, phone, email, address } = body;
    // Membuat instance License baru dari data license yang diberikan
    const newLicense = new License(body.license);
    // Membuat instance MedicalProfessional baru dengan role "pharmacist"
    const newPharmacist = new MedicalProfessional(
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
        "pharmacist",
        null,
        newLicense
    );

    try {
        // Memulai transaksi database
        await db.transaction(async (connection: PoolConnection) => {

            // Membuat record user untuk pharmacist
            const [userRes] = await connection.execute<ResultSetHeader>(userQueries.create, [
                newPharmacist.prefix,
                newPharmacist.suffix,
                newPharmacist.firstName,
                newPharmacist.lastName,
                newPharmacist.dateOfBirth,
                newPharmacist.gender,
                newPharmacist.phone,
                null,
                null,
                newPharmacist.address,
                false
            ]);
            // Mengupdate id pharmacist dengan insertId dari table users
            newPharmacist.id = userRes.insertId;
    
            // Membuat record license untuk pharmacist
            const [licenseRes] = await connection.execute<ResultSetHeader>(licenseQueries.create, [
                newLicense.number,
                newLicense.issuingAuthority,
                newLicense.issueDate,
                newLicense.expiryDate,
                null
            ]);
            // Mengupdate id license pada objek pharmacist
            newPharmacist.license.id = licenseRes.insertId;
    
            // Membuat record medical professional untuk pharmacist
            await connection.execute<ResultSetHeader>(medicalProfessionalsQueries.create, [
                newPharmacist.id,
                newPharmacist.role,
                null,
                newPharmacist.license.id,
                'pending'
            ]);
            
            return true;
        });
        // Mengembalikan objek pharmacist yang baru dibuat
        return newPharmacist;
    } catch (error) {
        // Melempar ulang error jika terjadi kesalahan
        throw error;
    }
}