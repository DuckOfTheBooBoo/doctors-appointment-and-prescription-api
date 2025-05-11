// Mengimpor fungsi createDoctor dari controller doctor
import { createDoctor } from "@/controllers/doctor.controller";
// Mengimpor Router dari express
import { Router } from "express";

const doctorRouter = Router(); // Membuat instance router untuk doctor

doctorRouter.post("/", createDoctor); // Mendefinisikan route POST untuk membuat doctor baru

export default doctorRouter; // Mengekspor router doctor