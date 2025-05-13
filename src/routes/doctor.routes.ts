// Mengimpor fungsi createDoctor dari controller doctor
import { createDoctor, getDoctors, addSchedule, getDoctorDetails, updateSchedule } from "@/controllers/doctor.controller";
import { jwtMiddleware } from "@/middlewares/jwt.middleware";
// Mengimpor Router dari express
import { Router } from "express";

const doctorRouter = Router(); // Membuat instance router untuk doctor

doctorRouter.post("/", createDoctor); // Mendefinisikan route POST untuk membuat doctor baru
doctorRouter.get("/", jwtMiddleware, getDoctors);
doctorRouter.get("/:doctor_id", jwtMiddleware, getDoctorDetails); // New endpoint for doctor details
doctorRouter.post("/:doctor_id/schedules", jwtMiddleware, addSchedule); // Route untuk menambahkan jadwal
doctorRouter.put("/:doctor_id/schedules/:schedule_id", jwtMiddleware, updateSchedule); // Route untuk memperbarui jadwal

export default doctorRouter; // Mengekspor router doctor