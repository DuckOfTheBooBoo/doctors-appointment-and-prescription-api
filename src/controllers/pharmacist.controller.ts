// Mengimpor fungsi service untuk membuat pharmacist
import { NotFoundError } from "@/errors";
import { deactivateMedicalProfessionalService } from "@/services/doctor.service";
import { createPharmacistService } from "@/services/pharmacist.service";
// Mengimpor tipe PharmacistInput
import { PharmacistInput } from "@/types/common";
// Mengimpor tipe Request dan Response dari express
import type { Request, Response } from "express";
// Mengimpor modul zod untuk validasi
import { z } from "zod";

/**
 * @swagger
 * /pharmacists:
 *   post:
 *     summary: Create a new pharmacist account
 *     tags:
 *       - Pharmacists
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - date_of_birth
 *               - gender
 *               - phone
 *               - email
 *               - address
 *               - license
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: John
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *                 example: 1980-01-01
 *               gender:
 *                 type: string
 *                 enum: [M, F]
 *                 example: M
 *               phone:
 *                 type: string
 *                 example: "+628123456789"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               address:
 *                 type: string
 *                 example: "123 Main St"
 *               prefix:
 *                 type: string
 *                 nullable: true
 *                 example: Dr.
 *               suffix:
 *                 type: string
 *                 nullable: true
 *                 example: PhD
 *               license:
 *                 type: object
 *                 required:
 *                   - number
 *                   - issuing_authority
 *                   - issue_date
 *                   - expiry_date
 *                 properties:
 *                   number:
 *                     type: string
 *                     example: "ABC12345"
 *                   issuing_authority:
 *                     type: string
 *                     example: "Health Ministry"
 *                   issue_date:
 *                     type: string
 *                     format: date
 *                     example: "2020-01-01"
 *                   expiry_date:
 *                     type: string
 *                     format: date
 *                     example: "2030-01-01"
 *     responses:
 *       201:
 *         description: Account creation successful, waiting for admin approval
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Account creation successful. Please wait for admin approval to proceed.
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Validation failed
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                         example: first_name
 *                       error:
 *                         type: string
 *                         example: Please provide first name.
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Something went wrong.
 */

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
/**
 * @swagger
 * /pharmacists/{pharmacist_id}/deactivate:
 *   patch:
 *     summary: Deactivate a pharmacist account
 *     tags:
 *       - Pharmacists
 *     parameters:
 *       - in: path
 *         name: pharmacist_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the pharmacist to deactivate
 *     responses:
 *       200:
 *         description: Pharmacist deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Pharmacist deactivated successfully
 *       400:
 *         description: Validation failed (invalid pharmacist_id)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Validation failed
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                         example: pharmacist_id
 *                       message:
 *                         type: string
 *                         example: pharmacist_id should be a number
 *       404:
 *         description: Pharmacist not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Pharmacist not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Something went wrong.
 */
export async function deactivatePharmacist(req: Request, res: Response) {
    const { pharmacist_id } = req.params;
    const pharmacistId = parseInt(pharmacist_id, 10);
    if (isNaN(pharmacistId)) {
        res.status(400).json({
            message: "Validation failed",
            errors: [
                { field: "pharmacist_id", message: "pharmacist_id should be a number" } 
            ]
        });
        return;
    }

    try {
        // Call service to deactivate the doctor
        await deactivateMedicalProfessionalService(pharmacistId);
        res.status(200).json({
            message: "Pharmacist deactivated successfully"
        });
    } catch (error) {
        console.error(error);
        if (error instanceof NotFoundError) {
            res.status(404).json({
                message: error.message
            });
            return;
        }
        res.status(500).json({
            message: "Something went wrong."
        });
    }
}