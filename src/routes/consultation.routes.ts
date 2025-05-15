import { Router } from "express";
import { createConsultation, createPrescription, getConsultationSummary, getDoctorConsultations } from "@/controllers/consultation.controller";

const consultationRouter = Router();

consultationRouter.post("/", createConsultation);
consultationRouter.get("/doctor", getDoctorConsultations);
consultationRouter.get("/:consultation_id", getConsultationSummary);
consultationRouter.post("/:consultation_id", createPrescription);
// New route for doctors to get their consultations

export default consultationRouter;
