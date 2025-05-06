import { db } from "@/db";
import { userQueries } from "@/db/queries/user.queries";
import { User } from "@/models/user.model";
import { hashPassword } from "@/utils/bcrypt";

export async function createUserService(
    firstName: string,
    lastName: string | null,
    dateOfBirth: string,
    gender: "M" | "F",
    phone: string,
    email: string,
    password: string,
    address: string
): Promise<User> {
    const hashedPassword = await hashPassword(password);
    const newUser = new User(null, firstName, lastName, dateOfBirth, gender, phone, email, hashedPassword, address);

    try {
        const result = await db.execute(userQueries.create, [firstName, lastName, dateOfBirth, gender, phone, email, hashedPassword, address, true]);
        newUser.id = result.insertId;
        return newUser;
    } catch (error) {
        console.error("Error while creating user:", error);
        throw error;
    }
}