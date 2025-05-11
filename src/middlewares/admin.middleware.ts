// Mengimpor konfigurasi environment
import { env } from "@/config/env.config";
// Mengimpor tipe NextFunction, Request, dan Response dari express
import type { NextFunction, Request, Response } from "express";

// Middleware untuk otorisasi admin berdasarkan ADMIN_KEY
export function adminAuth(req: Request, res: Response, next: NextFunction): void {
    // Mendapatkan ADMIN_KEY dari query parameter
    const { ADMIN_KEY } = req.query;

    // Jika ADMIN_KEY tidak ada atau tidak cocok dengan yang ada di environment
    if (!ADMIN_KEY || ADMIN_KEY !== env.ADMIN_KEY) {
        // Mengirim response error 401 Unauthorized
        res.status(401).json({
            message: "Please provide admin key"
        });
        return;
    }

    // Melanjutkan ke middleware/handler berikutnya
    next();
}