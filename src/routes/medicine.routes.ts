import { Router } from "express";
import { addMedicine, deleteMedicine, updateMedicineStock } from "@/controllers/medicine.controller";

const medicineRouter = Router();

medicineRouter.post("/", addMedicine);
// New route to update medicine stock
medicineRouter.patch("/:medicine_id", updateMedicineStock);
medicineRouter.delete("/:medicine_id", deleteMedicine);

export default medicineRouter;
