import { db } from "@/db";
import { licenseQueries } from "@/db/queries/license.queries";
import { medicalProfessionalsQueries } from "@/db/queries/medicalProfessionals.queries";
import { userQueries } from "@/db/queries/user.queries";
import { License } from "@/models/license.model";
import { MedicalProfessional } from "@/models/medicalProfessional.model";
import { DoctorInput } from "@/types/common";
import { format, ResultSetHeader, type PoolConnection } from "mysql2/promise";

export async function createDoctorService(body: DoctorInput): Promise<MedicalProfessional> {
    const { prefix, suffix, first_name, last_name, date_of_birth, gender, phone, email, address } = body;
    console.log(body)
    const newLicense = new License(body.license);
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
        await db.transaction(async (connection: PoolConnection) => {

            // Prepare the query and parameters
            const userQuery = userQueries.create;
            const userParams = [newDoctor.prefix, newDoctor.suffix, newDoctor.firstName, newDoctor.lastName, newDoctor.dateOfBirth, newDoctor.gender, newDoctor.phone, newDoctor.email, null, newDoctor.address, false];

            // Log the final query
            console.log("Executing query:", format(userQuery, userParams));
            
            // Create doctor's user record
            const [userRes] = await connection.execute<ResultSetHeader>(userQueries.create, [newDoctor.prefix, newDoctor.suffix, newDoctor.firstName, newDoctor.lastName, newDoctor.dateOfBirth, newDoctor.gender, newDoctor.phone, null, null, newDoctor.address, false]);
            newDoctor.id = userRes.insertId;
    
            console.log(format(licenseQueries.create, [newLicense.number, newLicense.issuingAuthority, newLicense.issueDate, newLicense.expiryDate, newLicense.specialty]))

            // Create doctor's license
            const [licenseRes] = await connection.execute<ResultSetHeader>(licenseQueries.create, [newLicense.number, newLicense.issuingAuthority, newLicense.issueDate, newLicense.expiryDate, newLicense.specialty])
            newDoctor.license.id = licenseRes.insertId;
    
            // Create doctor's record
            await connection.execute<ResultSetHeader>(medicalProfessionalsQueries.create, [newDoctor.id, newDoctor.role, newDoctor.specialization, newDoctor.license.id, 'pending'])
            
            return true;
        });

        return newDoctor;
    } catch (error) {
        throw error;
    }
}