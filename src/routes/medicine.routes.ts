import { Router } from "express";
import { addMedicine, updateMedicineStock } from "@/controllers/medicine.controller";

const medicineRouter = Router();

medicineRouter.post("/", addMedicine);
// New route to update medicine stock
medicineRouter.patch("/:id", updateMedicineStock);

export default medicineRouter;
