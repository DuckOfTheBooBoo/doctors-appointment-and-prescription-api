import { Router } from "express";
import { createConsultation, createPrescription } from "@/controllers/consultation.controller";

const consultationRouter = Router();

consultationRouter.post("/", createConsultation);
consultationRouter.post("/:consultation_id", createPrescription);

export default consultationRouter;
