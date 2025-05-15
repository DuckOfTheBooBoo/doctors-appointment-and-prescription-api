// Mengimpor fungsi createDoctor dari controller doctor
import { createDoctor, getDoctors, addSchedule, getDoctorDetails, updateSchedule, deactivateDoctor } from "@/controllers/doctor.controller";
import { adminAuth } from "@/middlewares/admin.middleware";
import { jwtMiddleware } from "@/middlewares/jwt.middleware";
// Mengimpor Router dari express
import { Router } from "express";

const doctorRouter = Router(); // Membuat instance router untuk doctor

doctorRouter.post("/", createDoctor); // Mendefinisikan route POST untuk membuat doctor baru
doctorRouter.get("/", jwtMiddleware, getDoctors);
doctorRouter.get("/:doctor_id", jwtMiddleware, getDoctorDetails); // New endpoint for doctor details
doctorRouter.post("/me/schedules", jwtMiddleware, addSchedule); // Route untuk menambahkan jadwal
doctorRouter.put("/me/schedules/:schedule_id", jwtMiddleware, updateSchedule); // Route untuk memperbarui jadwal
doctorRouter.delete("/:doctor_id", adminAuth, deactivateDoctor); // Route untuk menghapus jadwal

export default doctorRouter; // Mengekspor router doctor