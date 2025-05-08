import { createPharmacist } from "@/controllers/pharmacist.controller";
import { Router } from "express";

const pharmacistRouter = Router();

pharmacistRouter.post("/", createPharmacist);

export default pharmacistRouter;