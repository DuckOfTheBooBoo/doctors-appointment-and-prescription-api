import { db } from "@/db";
import { userQueries } from "@/db/queries/user.queries";
import { DuplicateError } from "@/errors";
import { User } from "@/models/user.model";
import { MySQLError, UserInput } from "@/types/common";
import { hashPassword } from "@/utils/bcrypt";
import { format } from "mysql2";

export async function createUserService(body: UserInput): Promise<User> {
    const { prefix, suffix, first_name, last_name, date_of_birth, gender, email, password, phone, address } = body;
    const hashedPassword = await hashPassword(password!);
    const newUser = new User(null, prefix, suffix, first_name, last_name, date_of_birth, gender, phone, email, hashedPassword, address, true, new Date(), new Date());
    
    try {
        console.log(format(userQueries.create, [newUser.prefix, newUser.suffix, newUser.firstName, newUser.lastName, newUser.dateOfBirth, gender, phone, email, hashedPassword, address, true]))
        const result = await db.execute(
            userQueries.create,
            [
                newUser.prefix,
                newUser.suffix,
                newUser.firstName,
                newUser.lastName,
                newUser.dateOfBirth,
                newUser.gender,
                newUser.phone,
                newUser.email,
                newUser.password,
                newUser.address,
                newUser.isActive,
            ]
        );
        newUser.id = result.insertId;
        return newUser;
    } catch (error) {
        const err = error as MySQLError;
        if (err.errno && err.errno === 1062) {
            throw new DuplicateError(err.sqlMessage);
        }
        
        console.error("Error while creating user:", error);
        throw error;
    }
}