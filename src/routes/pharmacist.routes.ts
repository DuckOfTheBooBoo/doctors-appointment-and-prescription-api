// Mengimpor fungsi createPharmacist dari controller pharmacist
import { createPharmacist } from "@/controllers/pharmacist.controller";
// Mengimpor Router dari express
import { Router } from "express";

const pharmacistRouter = Router(); // Membuat instance router untuk pharmacist

pharmacistRouter.post("/", createPharmacist); // Mendefinisikan route POST untuk pharmacist baru

export default pharmacistRouter; // Mengekspor router pharmacist