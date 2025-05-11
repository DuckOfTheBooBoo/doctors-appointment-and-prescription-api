// Mengimpor koneksi database
import { db } from "@/db";
// Mengimpor query user dari "@/db/queries/user.queries"
import { userQueries } from "@/db/queries/user.queries";
// Mengimpor error InvalidCredentialsError
import { InvalidCredentialsError } from "@/errors";
// Mengimpor model User
import { User } from "@/models/user.model";
// Mengimpor fungsi checkPassword
import { checkPassword } from "@/utils/bcrypt";
// Mengimpor fungsi signToken untuk membuat token JWT
import { signToken } from "@/utils/jwt";
// Mengimpor RowDataPacket untuk tipe data query
import { RowDataPacket } from "mysql2";

// Mendefinisikan interface untuk hasil query user
interface UserQuery extends RowDataPacket {
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
}

// Fungsi untuk menangani proses login
export async function loginService(email: string, password: string): Promise<string> {
    try {
        // Mencari user berdasarkan email yang diberikan
        const result = await db.query<UserQuery[]>(userQueries.getByEmail, [email]);
        // Jika tidak ada user ditemukan, lempar error InvalidCredentialsError
        if (result.length === 0) {
            throw new InvalidCredentialsError('Invalid credentials');
        }
        // Mengambil baris pertama dari hasil query
        const data = result[0];
        // Membuat instance User dengan data dari database
        const user = new User(
            data.id, data.prefix, data.suffix, data.first_name, data.last_name,
            data.date_of_birth, data.gender, data.phone, data.email, data.password, data.address,
            true, new Date(), new Date()
        );
        // Memeriksa kecocokan password menggunakan fungsi checkPassword
        const isValid = await checkPassword(password, user.password!);
        if (!isValid) {
            throw new InvalidCredentialsError('Invalid credentials');
        }
        // Menandatangani token JWT dengan id user dan role 'patient'
        const token = signToken(user.id!, 'patient');
        return token;
    } catch (error) {
        // Mencetak error jika terjadi masalah saat autentikasi
        console.error("Error while authenticating user:", error);
        throw error;
    }
}