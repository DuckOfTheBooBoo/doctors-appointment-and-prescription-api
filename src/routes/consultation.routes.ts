import { Router } from "express";
import { createConsultation, createPrescription, getConsultationSummary } from "@/controllers/consultation.controller";

const consultationRouter = Router();

consultationRouter.post("/", createConsultation);
consultationRouter.get("/:consultation_id", getConsultationSummary)
consultationRouter.post("/:consultation_id", createPrescription);

export default consultationRouter;
