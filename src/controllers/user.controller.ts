// Mengimpor error DuplicateError dari "@/errors"
import { DuplicateError, NotFoundError } from '@/errors';
// Mengimpor model User dari "@/models/user.model"
import { User } from '@/models/user.model';
// Mengimpor fungsi service untuk membuat user baru
import { createUserService, deactivateUserService } from '@/services/user.service';
// Mengimpor tipe Request dan Response dari express
import type { Request, Response } from 'express';
// Mengimpor modul zod untuk validasi
import { z } from 'zod';

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user account
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/User"
 *     responses:
 *       201:
 *         description: Account creation successful. Wait for admin approval.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  message:
 *                      type: string
 *                      example: "Account creation successful"
 *                  data:
 *                      $ref: "#/components/schemas/User"
 *       400:
 *         description: Validation failed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/BadResponse"
 *       409:
 *          description:  Duplicate record, could be because of email or phone.
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: "#/components/schemas/ConflictResponse"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/InternalErrorResponse"
 */


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

/**
 * @swagger
 * /users/{user_id}:
 *   delete:
 *     summary: Deactivate a user account
 *     security:
 *       - JWTAuth: []
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user to deactivate.
 *     responses:
 *       200:
 *         description: User deactivated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *       400:
 *         description: Validation failed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/BadResponse"
 *       403:
 *         description: Unauthorized action.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/UnauthorizedResponse"
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/NotFoundResponse"
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/InternalErrorResponse"
 */
export async function deactivateUser(req: Request, res: Response): Promise<void> {

    const validationSchema = z.object({
        user_id: z.preprocess((val) => typeof val === "string" ? parseInt(val, 10) : val, z.number().int())
    })

    const valResult = validationSchema.safeParse(req.params);

    if (!valResult.success) {
        const errors = valResult.error.errors.map(err => ({
            field: err.path[0],
            error: err.message
        }));
        res.status(400).json({
            message: "Validation failed",
            errors
        });
        return;
    }

    if (valResult.data.user_id !== req.decodedToken.userId) {
        res.status(403).json({
            message: "You are not authorized to perform this action."
        });
        return;
    }

    try {
        await deactivateUserService(valResult.data.user_id);

        res.status(200).json({
            message: "User deactivated successfully.",
        });
        return;
    } catch (error) {

        if (error instanceof NotFoundError) {
            res.status(404).json({
                message: error.message
            });
            return;
        }

        console.error(error);
        res.status(500).json({
            message: "Something went wrong."
        });
        return;
    }
}