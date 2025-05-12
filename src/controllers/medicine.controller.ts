import { NotFoundError } from "@/errors";
import { addMedicineService, updateMedicineStockService } from "@/services/medicine.service";
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

export async function updateMedicineStock(req: Request, res: Response) {
    // Check permissions like in addMedicine
    if (!["pharmacist"].includes(req.decodedToken.role)) {
        res.status(403).json({
            message: "You're not authorized to make this request"
        });
        return;
    }

    // Validate the stock in request body
    const schemaBody = z.object({
        stock: z.number().int().nonnegative("Stock must be a non-negative number")
    });
    // Validate the id from URL
    const schemaParams = z.object({
        id: z.string().regex(/^\d+$/, "Invalid medicine id")
    });

    const parseBody = schemaBody.safeParse(req.body);
    const parseParams = schemaParams.safeParse(req.params);
    if (!parseBody.success || !parseParams.success) {
        const errors = [
            ...(!parseParams.success
                ? parseParams.error.errors.map(err => ({ field: err.path[0], error: err.message }))
                : []),
            ...(!parseBody.success
                ? parseBody.error.errors.map(err => ({ field: err.path[0], error: err.message }))
                : [])
        ];
        res.status(400).json({ message: "Validation failed", errors });
        return;
    }

    const medicineId = parseInt(parseParams.data.id);
    const { stock } = parseBody.data;

    try {
        const medicine = await updateMedicineStockService(medicineId, stock);
        res.status(200).json({
            message: "Medicine stock updated successfully",
            data: medicine
        });
    } catch (error) {

        if (error instanceof NotFoundError) {
            res.status(404).json({
                message: error.message
            });
            return;
        }

        console.error(error);
        res.status(500).json({ message: "Something went wrong." });
    }
}
