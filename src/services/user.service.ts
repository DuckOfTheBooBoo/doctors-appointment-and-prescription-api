// Mengimpor koneksi database dari module "@/db"
import { db } from "@/db";
// Mengimpor query yang digunakan untuk operasi user dari "@/db/queries/user.queries"
import { userQueries } from "@/db/queries/user.queries";
// Mengimpor error khusus DuplicateError dari module "@/errors"
import { DuplicateError, NotFoundError } from "@/errors";
// Mengimpor model User dari "@/models/user.model"
import { User } from "@/models/user.model";
// Mengimpor tipe MySQLError dan UserInput dari "@/types/common"
import { MySQLError, UserInput } from "@/types/common";
// Mengimpor fungsi hashPassword dari "@/utils/bcrypt"
import { hashPassword } from "@/utils/bcrypt";

// Membuat fungsi service untuk membuat user baru
export async function createUserService(body: UserInput): Promise<User> {
    // Mendestruktur body untuk properti yang diperlukan
    const { prefix, suffix, first_name, last_name, date_of_birth, gender, email, password, phone, address } = body;
    // Mengenkripsi password menggunakan fungsi hashPassword
    const hashedPassword = await hashPassword(password!);
    // Membuat instance baru dari class User
    const newUser = new User(null, prefix, suffix, first_name, last_name, date_of_birth, gender, phone, email, hashedPassword, address, true, new Date(), new Date());
    
    try {
        // Mengeksekusi query untuk membuat user baru ke database
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
        // Mengupdate properti id dengan insertId dari database
        newUser.id = result.insertId;
        // Mengembalikan objek user baru
        return newUser;
    } catch (error) {
        // Menangani error dan casting ke tipe MySQLError
        const err = error as MySQLError;
        // Jika error merupakan duplicate key error (errno 1062), lempar DuplicateError
        if (err.errno && err.errno === 1062) {
            throw new DuplicateError(err.sqlMessage);
        }
        // Mencetak error dan melempar ulang error tersebut
        console.error("Error while creating user:", error);
        throw error;
    }
}

// Membuat fungsi service untuk menonaktifkan user
export async function deactivateUserService(userId: number): Promise<void> {
    try {
        // Mengecek apakah userId valid
        const rows = await db.query(userQueries.getById, [userId]);
        if (rows.length === 0) {
            throw new NotFoundError(`User with ID ${userId} does not exist.`);
        }

        // Mengeksekusi query untuk mengubah is_active menjadi 0 berdasarkan userId
        await db.execute(userQueries.deactivate, [userId]);
    } catch (error) {
        // Mencetak error dan melempar ulang error tersebut
        console.error("Error while deactivating user:", error);
        throw error;
    }
}