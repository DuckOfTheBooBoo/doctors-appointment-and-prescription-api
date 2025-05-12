// Mengimpor fungsi createDoctor dari controller doctor
import { createDoctor, getDoctors } from "@/controllers/doctor.controller";
import { jwtMiddleware } from "@/middlewares/jwt.middleware";
// Mengimpor Router dari express
import { Router } from "express";

const doctorRouter = Router(); // Membuat instance router untuk doctor

doctorRouter.post("/", createDoctor); // Mendefinisikan route POST untuk membuat doctor baru
doctorRouter.get("/", jwtMiddleware, getDoctors);

export default doctorRouter; // Mengekspor router doctor