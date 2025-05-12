import { Router } from "express";
import { addMedicine } from "@/controllers/medicine.controller";

const medicineRouter = Router();

medicineRouter.post("/", addMedicine);

export default medicineRouter;
