// Mengimpor fungsi pendingRegistrations dari controller admin
import { pendingRegistrations } from "@/controllers/admin.controller";
// Mengimpor middleware adminAuth untuk otorisasi admin
import { adminAuth } from "@/middlewares/admin.middleware";
// Mengimpor Router dari express
import { Router } from "express";

const adminRouter = Router(); // Membuat instance router untuk admin

adminRouter.use(adminAuth); // Menggunakan middleware adminAuth untuk autentikasi admin
adminRouter.get("/pending-registrations", pendingRegistrations); // Mendefinisikan route GET untuk pending registrations

// Endpoint untuk menyetujui pendaftaran user
adminRouter.post("/approve-registration", approveRegistration);

export default adminRouter; // Mengekspor router admin