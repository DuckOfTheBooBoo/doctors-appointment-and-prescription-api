import { createDoctor } from "@/controllers/doctor.controller";
import { Router } from "express";

const doctorRouter = Router();

doctorRouter.post("/", createDoctor);

export default doctorRouter;