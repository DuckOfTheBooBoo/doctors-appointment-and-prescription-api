// Mengimpor konfigurasi environment untuk JWT dari "@/config/env.config"
import { env } from '@/config/env.config';
// Mengimpor error khusus JWTInvalidError dari "@/errors"
import { JWTInvalidError } from '@/errors';
// Mengimpor modul jwt untuk operasi token
import jwt from 'jsonwebtoken';

// Mendefinisikan interface untuk payload JWT
export interface JWTPayload {
    userId: number;
    role: string;
    iat?: number;
    exp?: number;
}

// Fungsi untuk menandatangani dan menghasilkan token JWT
export function signToken(userId: number, role: string): string {
    // Membuat payload dengan userId dan role
    const payload: JWTPayload = {userId, role};
    // Menentukan opsi token termasuk waktu kadaluarsa
    const options = {expiresIn: env.JWT_EXPIRES_IN}
    // Mengembalikan token yang sudah di-sign menggunakan rahasia JWT
    return jwt.sign(payload, env.JWT_SECRET!, options);
}

// Fungsi untuk memverifikasi token JWT yang diberikan
export function verifyToken(token: string, options?: jwt.VerifyOptions): JWTPayload {
    try {
        // Memverifikasi token dan mengembalikan payload jika valid
        return jwt.verify(token, env.JWT_SECRET as string, options) as JWTPayload;
    } catch (error) {
        // Melempar error JWTInvalidError jika token tidak valid
        throw new JWTInvalidError("Invalid token");
    }
}