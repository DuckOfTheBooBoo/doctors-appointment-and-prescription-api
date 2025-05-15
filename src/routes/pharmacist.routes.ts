// Mengimpor fungsi createPharmacist dari controller pharmacist
import { createPharmacist, deactivatePharmacist } from "@/controllers/pharmacist.controller";
import { adminAuth } from "@/middlewares/admin.middleware";
// Mengimpor Router dari express
import { Router } from "express";

const pharmacistRouter = Router(); // Membuat instance router untuk pharmacist

pharmacistRouter.post("/", createPharmacist); // Mendefinisikan route POST untuk pharmacist baru
pharmacistRouter.delete("/:pharmacist_id", adminAuth, deactivatePharmacist); // Mendefinisikan route DELETE untuk menonaktifkan pharmacist berdasarkan ID

export default pharmacistRouter; // Mengekspor router pharmacist