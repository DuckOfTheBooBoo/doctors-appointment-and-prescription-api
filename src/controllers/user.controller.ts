// Mengimpor error DuplicateError dari "@/errors"
import { DuplicateError } from '@/errors';
// Mengimpor model User dari "@/models/user.model"
import { User } from '@/models/user.model';
// Mengimpor fungsi service untuk membuat user baru
import { createUserService } from '@/services/user.service';
// Mengimpor tipe Request dan Response dari express
import type { Request, Response } from 'express';
// Mengimpor modul zod untuk validasi
import { z } from 'zod';

export async function createNewUser(req: Request, res: Response): Promise<void> {
    // Mendefinisikan schema validasi untuk field-field wajib
    const validationSchema = z.object({
        first_name: z.string().min(1, "Please provide first name."),
        date_of_birth: z.string()
            .min(1, "Please provide date of birth.")
            .regex(/^\d{4}-\d{2}-\d{2}$/, "Date format is incorrect (YYYY-MM-DD)"),
        gender: z.string()
            .min(1, "Please provide gender.")
            .refine(val => ['M', 'F'].includes(val), "Gender must be M or F"),
        email: z.string()
            .min(1, "Please provide email")
            .email("Invalid email format"),
        password: z.string()
            .min(1, "Please provide password")
            .min(8, "Password must be at least 8 characters"),
        phone: z.string()
            .min(1, "Please provide phone number.")
            .regex(/^\+?[1-9]\d{1,14}$/, "Phone number format is invalid"),
        address: z.string().min(1, "Please provide address.")
    });

    // Mem-validasi request body dengan schema di atas
    const result = validationSchema.safeParse(req.body);

    if (!result.success) {
        // Jika validasi gagal, mapping error dan mengirim response 400
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

    // Jika prefix/suffix tidak diberikan, set menjadi null
    if (!req.body.prefix) {
        req.body.prefix = null;
    }
    if (!req.body.suffix) {
        req.body.suffix = null;
    }

    try {
        // Memanggil service untuk membuat user baru
        const newUser: User = await createUserService(req.body);
        
        // Mengirim response sukses dengan status 201
        res.status(201).json({
            message: "Account creation successful",
            data: newUser,
            errors: null,
            next: {
                login: "/auth/login"
            }
        });

    } catch (error) {
        // Jika terjadi DuplicateError, kirim response 409
        if (error instanceof DuplicateError) {
            res.status(409).json({
                message: error.message
            });    
            return;
        }
        // Mencetak error dan mengirim response 500
        console.error(error)
        res.status(500).json({
            message: "Something went wrong."
        });
        return;
    }
    return;
}