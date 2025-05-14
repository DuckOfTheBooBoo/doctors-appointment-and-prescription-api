// Mengimpor fungsi service untuk mengambil pending registrations
import { pendingRegistrationsService, approveInvitationService } from "@/services/admin.service";
// Mengimpor tipe Request dan Response dari express
import type { Request, Response } from "express";
import { z } from "zod";

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
        console.error("Error approving invitation:", error);
        res.status(500).json({
            message: "Failed to approve user invitation."
        });
        return;
    }
}

