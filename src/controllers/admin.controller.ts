// Mengimpor fungsi service untuk mengambil pending registrations
import { pendingRegistrationsService, approveInvitationService } from "@/services/admin.service";
// Mengimpor tipe Request dan Response dari express
import type { Request, Response } from "express";

// Fungsi untuk mengambil semua pending registrations
export async function pendingRegistrations(_: Request, res: Response) {
    try {
        // Mengambil data pending registrations melalui service
        const data = await pendingRegistrationsService();

        // Mengirim response sukses dengan data yang diambil
        return res.status(200).json({
            message: null,
            data
        });
    } catch (error) {
        // Mencetak error dan mengirim response 500 jika terjadi masalah
        console.error("Error during fetching all pending registrations:", error);
        return res.status(500).json({
            message: "Something went wrong. Please try again later."
        });
    }
}

export async function approveRegistration(req: Request, res: Response) {
    try {
        const { invitationId, password } = req.body;

        // Validasi input
        if (!invitationId || !password) {
            return res.status(400).json({
                message: "invitationId dan password wajib diisi."
            });
        }

        // Proses approval via service
        const result = await approveInvitationService(invitationId, password);

        // Berhasil
        return res.status(200).json({
            message: "User invitation approved successfully.",
            data: result
        });
    } catch (error) {
        console.error("Error approving invitation:", error);
        return res.status(500).json({
            message: "Failed to approve user invitation."
        });
    }
    
    // Add this return statement at the end of the function
    // This satisfies TypeScript's control flow analysis
    return res.status(500).json({
        message: "Unexpected error occurred."
    });
}

