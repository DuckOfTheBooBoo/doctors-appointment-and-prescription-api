import { Router } from "express";
import { addMedicine, deleteMedicine, updateMedicineStock, getAllMedicines } from "@/controllers/medicine.controller";
import { jwtMiddleware } from "@/middlewares/jwt.middleware";

const medicineRouter = Router();

medicineRouter.get("/", jwtMiddleware, getAllMedicines);
medicineRouter.post("/", addMedicine);
medicineRouter.patch("/:medicine_id", updateMedicineStock);
medicineRouter.delete("/:medicine_id", deleteMedicine);

export default medicineRouter;
