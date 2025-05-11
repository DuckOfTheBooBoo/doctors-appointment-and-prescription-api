// Mengimpor fungsi service untuk membuat pharmacist
import { createPharmacistService } from "@/services/pharmacist.service";
// Mengimpor tipe PharmacistInput
import { PharmacistInput } from "@/types/common";
// Mengimpor tipe Request dan Response dari express
import type { Request, Response } from "express";
// Mengimpor modul zod untuk validasi
import { z } from "zod";

export async function createPharmacist(req: Request, res: Response) {
    // Mendefinisikan schema validasi untuk data license
    const licenseSchema = z.object({
        number: z.string().min(1, "Please provide license's number"),
        issuing_authority: z.string().min(1, "Please provide license issuing authority"),
        issue_date: z.string().min(1, "Please provide license issue date").date("Date format is incorrect (YYYY-MM-DD)"),
        expiry_date: z.string().min(1, "Please provide license expiry date").date("Date format is incorrect (YYYY-MM-DD)").refine(val => new Date(val) > new Date(), "License expired")
    });
    
    // Mendefinisikan schema validasi untuk pharmacist
    const validationSchema = z.object({
        first_name: z.string().min(1, "Please provide first name."),
        date_of_birth: z.string()
            .min(1, "Please provide date of birth.")
            .date("Date format is incorrect (YYYY-MM-DD)"),
        gender: z.string()
            .min(1, "Please provide gender.")
            .refine(val => ['M', 'F'].includes(val), "Gender must be M or F"),
        phone: z.string()
            .min(1, "Please provide phone number.")
            .regex(/^\+?[1-9]\d{1,14}$/, "Phone number format is invalid"),
        email: z.string().min(1, "Please provide email.").email('Invalid email format'),
        address: z.string().min(1, "Please provide address."),
        license: licenseSchema
    });

    // Validasi request body
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

    // Set prefix/suffix ke null bila tidak ada
    if (!req.body.prefix) {
        req.body.prefix = null;
    }
    if (!req.body.suffix) {
        req.body.suffix = null;
    }

    try {
        // Memanggil service untuk membuat pharmacist
        await createPharmacistService(req.body as PharmacistInput);
        // Mengirim response sukses 201 dengan pesan persetujuan admin
        res.status(201).json({
            message: "Account creation successful. Please wait for admin approval to proceed.",
        });

    } catch (error) {
        // Mencetak error dan mengirim response 500 jika terjadi kesalahan
        console.error(error)
        res.status(500).json({
            message: "Something went wrong."
        });
        return;
    }
    return;
}