// Mengimpor koneksi database
import { db } from "@/db";
import { joinedQueries } from "@/db/queries/joined.queries";
// Mengimpor query user dari "@/db/queries/user.queries"
// Mengimpor error InvalidCredentialsError
import { InvalidCredentialsError, NotFoundError } from "@/errors";
// Mengimpor model User
// Mengimpor fungsi checkPassword
import { checkPassword, hashPassword } from "@/utils/bcrypt";
// Mengimpor fungsi signToken untuk membuat token JWT
import { signToken } from "@/utils/jwt";
// Mengimpor RowDataPacket untuk tipe data query
import { RowDataPacket } from "mysql2";

// Mendefinisikan interface untuk hasil query user
interface GetByEmailQuery extends RowDataPacket {
    id: number;
    prefix: string | null;
    suffix: string | null;
    first_name: string;
    last_name: string | null;
    date: Date;
    gender: "M" | "F";
    phone: string;
    email: string;
    password: string;
    address: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    role: "doctor" | "pharmacist" | null;
}

// Fungsi untuk menangani proses login
export async function loginService(email: string, password: string): Promise<string> {
    try {
        // Mencari user berdasarkan email yang diberikan
        const result = await db.query<GetByEmailQuery[]>(joinedQueries.getUserByEmail, [email]);
        // Jika tidak ada user ditemukan, lempar error InvalidCredentialsError
        if (result.length === 0) {
            throw new InvalidCredentialsError('Invalid credentials');
        }
        // Mengambil baris pertama dari hasil query
        const data = result[0];
        // Membuat instance User dengan data dari database
        // const user = new User(
        //     data.id, data.prefix, data.suffix, data.first_name, data.last_name,
        //     data.date_of_birth, data.gender, data.phone, data.email, data.password, data.address,
        //     true, new Date(), new Date() 
        // );
        // Memeriksa kecocokan password menggunakan fungsi checkPassword
        const isValid = await checkPassword(password, data.password);
        if (!isValid) {
            throw new InvalidCredentialsError('Invalid credentials');
        }

        const role: string = data.role ? data.role : 'patient';

        // Menandatangani token JWT dengan id user dan role 'patient'
        const token = signToken(data.id, role);
        return token;
    } catch (error) {
        // Lempar error jika terjadi masalah saat autentikasi
        throw error;
    }
}

// Fungsi untuk mengatur password baru
export async function setPassword(token: string, password: string): Promise<string> {
    try {
        return await db.transaction<string>(async (connection) => {
            // Find invitation by token
            const [tokenResult] = await connection.query<RowDataPacket[]>("SELECT * FROM user_invitations WHERE token = ?", [token]);
            if (tokenResult.length === 0) {
                throw new NotFoundError("Invitation not found");
            }
            const userId = tokenResult[0].user_id;

            // Check if user is not already activated
            const [userResult] = await connection.query<RowDataPacket[]>("SELECT * FROM users WHERE id = ? AND is_active = 0", [userId]);
            if (userResult.length === 0) {
                throw new NotFoundError("User may have been already activated.");
            }

            // Hash the new password before saving it
            const hashedNewPassword = await hashPassword(password);

            // Update the user's password and activate the account
            await connection.execute(
                "UPDATE users SET password = ?, is_active = 1 WHERE id = ?;", 
                [hashedNewPassword, userId]
            );

            // Update the status in medical_professionals table
            await connection.execute(
                "UPDATE medical_professionals SET status = 'active' WHERE id = ?", 
                [userId]
            );

            // Delete the invitation token
            await connection.execute(
                "DELETE FROM user_invitations WHERE token = ?", 
                [token]
            );

            return 'Set password successful. You may log in';
        });
    } catch (error) {
        // Propagate error if any step fails during the transaction
        throw error;
    }
}
