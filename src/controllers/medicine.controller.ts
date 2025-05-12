import { addMedicineService } from "@/services/medicine.service";
import { Request, Response } from "express";
import { z } from "zod";

export async function addMedicine(req: Request, res: Response) {

    if (!['pharmacist'].includes(req.decodedToken.role)) {
        res.status(403).json({
            message: "You're not authorized to make this request"
        });
        return;
    }

    const schema = z.object({
        name: z.string().min(1, "Please provide medicine name"),
        stock: z.number().int().nonnegative("Stock must be a non-negative number")
    });

    const result = schema.safeParse(req.body);
    if (!result.success) {
        const errors = result.error.errors.map(err => ({
            field: err.path[0],
            error: err.message
        }));
        res.status(400).json({ message: "Validation failed", errors });
        return;
    }

    try {
        const medicine = await addMedicineService(result.data);
        res.status(201).json({
            message: "Medicine added successfully",
            data: medicine
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong." });
    }
}
