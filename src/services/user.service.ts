import { db } from "@/db";
import { userQueries } from "@/db/queries/user.queries";
import { User } from "@/models/user.model";
import { UserInput } from "@/types/common";
import { hashPassword } from "@/utils/bcrypt";

export async function createUserService(body: UserInput): Promise<User> {
    const { prefix, suffix, first_name, last_name, date_of_birth, gender, email, password, phone, address } = body;
    const hashedPassword = await hashPassword(password!);
    const newUser = new User(null, prefix, suffix, first_name, last_name, date_of_birth, gender, phone, email, hashedPassword, address, true);

    try {
        const result = await db.execute(userQueries.create, [newUser.firstName, newUser.lastName, newUser.dateOfBirth, gender, phone, email, hashedPassword, address, true]);
        newUser.id = result.insertId;
        return newUser;
    } catch (error) {
        console.error("Error while creating user:", error);
        throw error;
    }
}