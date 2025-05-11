// Mengimpor variabel environment dari "@/config/env.config"
import { env } from "@/config/env.config";
// Mengimpor modul bcrypt untuk enkripsi password
import bcrypt from "bcrypt";

// Fungsi untuk menghasilkan hash dari password yang diberikan
export async function hashPassword(password: string): Promise<string> {
    try {
        // Menghasilkan hash menggunakan bcrypt dan jumlah SALT_ROUNDS dari environment
        const hash: string = await bcrypt.hash(password, env.SALT_ROUNDS);
        return hash;
    } catch(error) {
        // Mencetak error jika terjadi kegagalan saat membuat hash
        console.error("Failed during creating hash:", error);
        throw error;
    }
}

// Fungsi untuk membandingkan password plain dengan hashedPassword
export async function checkPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    try {
        // Menggunakan bcrypt.compare untuk validasi password
        return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
        // Mencetak error jika terjadi kesalahan saat membandingkan password
        console.error("Failed during comparing password:", error);
        throw error;
    }
}