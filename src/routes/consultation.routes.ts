import { Router } from "express";
import { createConsultation } from "@/controllers/consultation.controller";

const consultationRouter = Router();

consultationRouter.post("/", createConsultation);

export default consultationRouter;
