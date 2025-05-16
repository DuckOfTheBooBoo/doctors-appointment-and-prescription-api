// Mengimpor fungsi service untuk mengambil pending registrations
import { NotFoundError } from "@/errors";
import { pendingRegistrationsService, approveInvitationService } from "@/services/admin.service";
// Mengimpor tipe Request dan Response dari express
import type { Request, Response } from "express";
import { z } from "zod";

/**
 * @swagger
 * /admin/pending-registrations:
 *   get:
 *     summary: Get all pending user registrations
 *     security:
 *         - AdminAuth: []
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Successfully retrieved pending registrations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   nullable: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/UserWithLicense"
 *       500:
 *         description: Server error while retrieving pending registrations
 *         content:
 *          application/json:
 *           schema:
 *             $ref: "#/components/schemas/InternalErrorResponse"
 */

// Fungsi untuk mengambil semua pending registrations
export async function pendingRegistrations(_: Request, res: Response) {
    try {
        // Mengambil data pending registrations melalui service
        const data = await pendingRegistrationsService();

        // Mengirim response sukses dengan data yang diambil
        res.status(200).json({
            message: null,
            data
        });
        return;
    } catch (error) {
        // Mencetak error dan mengirim response 500 jika terjadi masalah
        console.error("Error during fetching all pending registrations:", error);
        res.status(500).json({
            message: "Something went wrong. Please try again later."
        });
        return;
    }
}

/**
 * @swagger
 * /admin/approve-registration:
 *   post:
 *     summary: Approve a user registration
 *     security:
 *         - AdminAuth: []
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: number
 *                 minimum: 0
 *             required:
 *               - user_id
 *     responses:
 *       200:
 *         description: User invitation approved successfully
 *         content:
 *           application/json:
 *             schema:
 *                $ref: "#/components/schemas/UserInvitation"
 *       400:
 *         description: Validation failed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/BadResponse"
 *       401:
 *         description: Invalid credentials.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Please provide admin key"
 *       404:
 *         description: Not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/NotFoundResponse"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/InternalErrorResponse"
 */
export async function approveRegistration(req: Request, res: Response) {
    try {

        const approveRegistrationSchema = z.object({
            user_id: z.number().nonnegative(),
        });

        const validation = approveRegistrationSchema.safeParse(req.body);

        if (!validation.success) {
            res.status(400).json({
                message: "Validation failed.",
                errors: validation.error.errors,
            });
            return;
        }

        // Proses approval via service
        const result = await approveInvitationService(validation.data.user_id);

        // Berhasil
        res.status(200).json({
            message: "User invitation approved successfully.",
            data: result
        });
        return;
    } catch (error) {
        if (error instanceof NotFoundError) {
            res.status(404).json({
                message: error.message
            });
            return;
        }

        console.error("Error approving invitation:", error);
        res.status(500).json({
            message: "Failed to approve user invitation."
        });
        return;
    }
}

