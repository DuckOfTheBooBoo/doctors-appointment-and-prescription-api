import { db } from "@/db";
import { doctorQueries } from "@/db/queries/doctor.queries";
import { licenseQueries } from "@/db/queries/license.queries";
import { userQueries } from "@/db/queries/user.queries";
import { Doctor } from "@/models/doctor.model";
import { License } from "@/models/license.model";
import { DoctorInput } from "@/types/common";
import { format, ResultSetHeader, type PoolConnection } from "mysql2/promise";

export async function createDoctorService(body: DoctorInput): Promise<Doctor> {
    const { prefix, suffix, first_name, last_name, date_of_birth, gender, phone, address } = body;
    console.log(body)
    const newLicense = new License(body.license);
    const newDoctor = new Doctor(null, prefix, suffix, first_name, last_name, date_of_birth, gender, phone, null, null, address, body.specialization, false, newLicense);

    try {
        await db.transaction(async (connection: PoolConnection) => {

            // Prepare the query and parameters
            const userQuery = userQueries.create;
            const userParams = [newDoctor.prefix, newDoctor.suffix, newDoctor.firstName, newDoctor.lastName, newDoctor.dateOfBirth, newDoctor.gender, newDoctor.phone, null, null, newDoctor.address, false];

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
            await connection.execute<ResultSetHeader>(doctorQueries.create, [newDoctor.id, newDoctor.specialization, newDoctor.license.id, 'pending'])
            
            return true;
        });

        return newDoctor;
    } catch (error) {
        throw error;
    }
}