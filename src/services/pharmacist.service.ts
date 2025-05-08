import { db } from "@/db";
import { licenseQueries } from "@/db/queries/license.queries";
import { pharmacistQueries } from "@/db/queries/pharmacist.queries";
import { userQueries } from "@/db/queries/user.queries";
import { License } from "@/models/license.model";
import { Pharmacist } from "@/models/pharmacist.model";
import { type PharmacistInput } from "@/types/common";
import { format, type ResultSetHeader, type PoolConnection } from "mysql2/promise";

export async function createPharmacistService(body: PharmacistInput): Promise<Pharmacist> {
    const { prefix, suffix, first_name, last_name, date_of_birth, gender, phone, address } = body;
    console.log(body)
    const newLicense = new License(body.license);
    const newPharmacist = new Pharmacist(null, prefix, suffix, first_name, last_name, date_of_birth, gender, phone, null, null, address, false, newLicense);

    try {
        await db.transaction(async (connection: PoolConnection) => {

            // Prepare the query and parameters
            const userQuery = userQueries.create;
            const userParams = [newPharmacist.prefix, newPharmacist.suffix, newPharmacist.firstName, newPharmacist.lastName, newPharmacist.dateOfBirth, newPharmacist.gender, newPharmacist.phone, null, null, newPharmacist.address, false];

            // Log the final query
            console.log("Executing query:", format(userQuery, userParams));
            
            // Create doctor's user record
            const [userRes] = await connection.execute<ResultSetHeader>(userQueries.create, [newPharmacist.prefix, newPharmacist.suffix, newPharmacist.firstName, newPharmacist.lastName, newPharmacist.dateOfBirth, newPharmacist.gender, newPharmacist.phone, null, null, newPharmacist.address, false]);
            newPharmacist.id = userRes.insertId;
    
            console.log(format(licenseQueries.create, [newLicense.number, newLicense.issuingAuthority, newLicense.issueDate, newLicense.expiryDate, newLicense.specialty]))

            // Create doctor's license
            const [licenseRes] = await connection.execute<ResultSetHeader>(licenseQueries.create, [newLicense.number, newLicense.issuingAuthority, newLicense.issueDate, newLicense.expiryDate, null])
            newPharmacist.license.id = licenseRes.insertId;
    
            // Create doctor's record
            await connection.execute<ResultSetHeader>(pharmacistQueries.create, [newPharmacist.id, newPharmacist.license.id, 'pending'])
            
            return true;
        });

        return newPharmacist;
    } catch (error) {
        throw error;
    }
}