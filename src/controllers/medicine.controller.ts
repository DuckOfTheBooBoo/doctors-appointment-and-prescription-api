import { InsufficientAuthorizationError, NotFoundError } from "@/errors";
import { addMedicineService, deleteMedicineService, updateMedicineStockService, getAllMedicinesService } from "@/services/medicine.service";
import { Request, Response } from "express";
import { z } from "zod";

/**
 * @swagger
 * /medicines:
 *   post:
 *     summary: Add a new medicine
 *     tags: [Medicine]
 *     security:
 *       - JWTAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - stock
 *             properties:
 *               name:
 *                 type: string
 *               stock:
 *                 type: integer
 *                 minimum: 0
 *     responses:
 *       201:
 *         description: Medicine added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Medicine added successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Medicine'
 *       400:
 *         description: Validation failed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/BadResponse"
 *       403:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/UnauthorizedResponse"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/InternalErrorResponse"
 */
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

/**
 * @swagger
 * /medicines/{medicine_id}:
 *   patch:
 *     summary: Update stock of a medicine
 *     tags: [Medicine]
 *     security:
 *       - JWTAuth: []
 *     parameters:
 *       - in: path
 *         name: medicine_id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the medicine to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - stock
 *             properties:
 *               stock:
 *                 type: integer
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Medicine updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Medicine stock updated successfully"
 *                 data:
 *                    $ref: "#/components/schemas/Medicine"
 *       400:
 *         description: Validation failed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/BadResponse"
 *       403:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/UnauthorizedResponse"
 *       404:
 *         description: Medicine not found.
 *         content:
 *         application/json:
 *              schema:
 *                 $ref: "#/components/schemas/NotFoundResponse"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/InternalErrorResponse"
 */

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
        medicine_id: z.string().regex(/^\d+$/, "Invalid medicine id")
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

    const medicineId = parseInt(parseParams.data.medicine_id);
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

/**
 * @swagger
 * /medicines/{medicine_id}:
 *   delete:
 *     summary: Delete a medicine
 *     tags: [Medicine]
 *     security:
 *       - JWTAuth: []
 *     parameters:
 *       - in: path
 *         name: medicine_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the medicine to delete
 *     responses:
 *       200:
 *         description: Medicine deleted successfully
 *         content:
 *             application/json:
 *              schema:
 *                  $ref: "#/components/schemas/SuccessResponse"
 *       400:
 *         description: Validation failed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/BadResponse"
 *       403:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  message:
 *                      type: string
 *                      example: "Failed to delete medicine. Medicine is referenced in a prescription."
 *       404:
 *         description: Medicine not found.
 *         content:
 *         application/json:
 *              schema:
 *                 $ref: "#/components/schemas/NotFoundResponse"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/InternalErrorResponse"
 */

export async function deleteMedicine(req: Request, res: Response) {
    const paramsSchema = z.object({
        medicine_id: z.preprocess((val) => typeof val === "string" ? parseInt(val, 10) : val, z.number().int())
    });

    const validationResult = paramsSchema.safeParse(req.params);

    if (!validationResult.success) {
        const errors = validationResult.error.errors.map(err => ({
            field: err.path[0],
            error: err.message
        }));
        res.status(400).json({ message: "Validation failed", errors });
        return;
    }

    try {
        const rowAffected = await deleteMedicineService(validationResult.data.medicine_id);
        if (rowAffected === 0) {
            res.status(404).json({
                message: "Medicine not found"
            });
            return;
        }
        res.status(200).json({
            message: "Medicine deleted successfully"
        });
        return;
    } catch (error) {

        if (error instanceof InsufficientAuthorizationError) {
            res.status(403).json({
                message: error.message
            });
            return;
        }

        res.status(500).json({
            message: "Something went wrong"
        });
        return;
    }
}

/**
 * @swagger
 * /medicines:
 * get:
 * summary: Get all medicines
 * tags: [Medicine]
 * security:
 * - JWTAuth: [] # Assuming JWTAuth is defined in your securitySchemes
 * responses:
 * 200:
 * description: Medicines retrieved successfully
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/GetAllMedicinesResponse'
 * 403:
 * description: Not authorized
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/UnauthorizedResponse' # Uses existing schema
 * 500:
 * description: Server error
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/InternalErrorResponse' # Uses existing schema
 */
export async function getAllMedicines(req: Request, res: Response) {
    if (!["pharmacist"].includes(req.decodedToken.role)) {
        res.status(403).json({
            message: "You're not authorized to make this request"
        });
        return;
    }
    try {
        const medicines = await getAllMedicinesService();
        res.status(200).json({
            message: "Medicines retrieved successfully",
            data: medicines
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong." });
    }
}
