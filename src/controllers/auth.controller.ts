// Mengimpor error InvalidCredentialsError
import { InvalidCredentialsError } from "@/errors";
// Mengimpor fungsi loginService dari service auth
import { loginService } from "@/services/auth.service";
// Mengimpor tipe Request dan Response dari express
import type { Request, Response } from "express";
// Mengimpor modul zod untuk validasi
import { z } from "zod";

export async function login(req: Request, res: Response) {   
    // Mendefinisikan schema validasi untuk email dan password
    const validationSchema = z.object({
        email: z.string()
            .min(1, "Please provide email")
            .email("Invalid email format"),
        password: z.string()
            .min(1, "Please provide password")
            .min(8, "Password must be at least 8 characters"),
    });

    // Validasi request body dengan schema di atas
    const result = validationSchema.safeParse(req.body);
    
    if (!result.success) {
        // Mapping error validasi dan mengirim response 400
        const errors = result.error.errors.map(error => ({
            field: error.path[0],
            error: error.message
        }));

        res.status(400).json({
            message: "Validation failed",
            errors
        });
        return;
    }

    try {
        // Memanggil service untuk login dan mendapatkan token JWT
        const token = await loginService(req.body.email, req.body.password);

        // Mengirim response sukses dengan token
        res.status(200).json({
            message: "Login successful",
            data: {
                token
            },
            next: {
            }
        })
        return;
    } catch (error) {
        // Jika error berkaitan dengan kredensial tidak valid, kirim response 401
        if (error instanceof InvalidCredentialsError) {
            res.status(401).json({
                message: error.message
            });
            return;
        }
        // Mencetak error dan mengirim response 500 untuk error lain
        console.error(error);
        res.status(500).json({
            message: "Something went wrong. Please try again later."
        });
    }
}