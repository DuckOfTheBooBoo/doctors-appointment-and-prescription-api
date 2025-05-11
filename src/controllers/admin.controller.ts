// Mengimpor fungsi service untuk mengambil pending registrations
import { pendingRegistrationsService } from "@/services/admin.service";
// Mengimpor tipe Request dan Response dari express
import type { Request, Response } from "express";

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
        })
    }
}