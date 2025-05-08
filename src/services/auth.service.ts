import { db } from "@/db";
import { userQueries } from "@/db/queries/user.queries";
import { InvalidCredentialsError } from "@/errors";
import { User } from "@/models/user.model";
import { checkPassword } from "@/utils/bcrypt";
import { signToken } from "@/utils/jwt";

export async function loginService(email: string, password: string): Promise<string> {
    try {
        const result = await db.query(userQueries.getByEmail, [email]);
        if (result.length === 0) {
            throw new InvalidCredentialsError('Invalid credentials');
        }

        const data = result[0];
        console.log(data);
        const user = new User(data.id, data.prefix, data.suffix, data.first_name, data.last_name, data.date_of_birth, data.gender, data.phone, data.email, data.password, data.address, true);

        const isValid = await checkPassword(password, user.password!);
        if (!isValid) {
            throw new InvalidCredentialsError('Invalid credentials');
        }

        const token = signToken(user.id!, 'patient');

        return token;
    } catch (error) {
        console.error("Error while authenticating user:", error);
        throw error;
    }
}