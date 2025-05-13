import { Request, Response } from "express";
import { z } from "zod";
import { createConsultationService } from "@/services/consultation.service";
import { createPrescriptionService } from "@/services/consultation.service";
import { DuplicateError, InsufficientAuthorizationError, InsufficientStockError, NotFoundError } from "@/errors";

export async function createConsultation(req: Request, res: Response) {
    if (!['patient'].includes(req.decodedToken.role)) {
        res.status(403).json({
            message: "You're not authorized to make this request."
        });
        return;
    }

    const consultationSchema = z.object({
        schedule_id: z.number().int()
    });

    const result = consultationSchema.safeParse(req.body);
    if (!result.success) {
        const errors = result.error.errors.map(err => ({
            field: err.path[0],
            error: err.message
        }));
        res.status(400).json({
            message: "Validation failed",
            errors
        });
        return;
    }
    
    try {
        const consultation = await createConsultationService({ user_id: req.decodedToken.userId, schedule_id: result.data.schedule_id });
        res.status(201).json({
            message: "Consultation created successfully",
            data: consultation
        });
    } catch (error) {

        if (error instanceof DuplicateError) {
            res.status(409).json({
                message: error.message
            });
            return;
        }

        console.error(error);
        res.status(500).json({
            message: "Something went wrong."
        });
    }
}

// export async function getPrescription(req: Request, res: Response) {
    
// }

export async function createPrescription(req: Request, res: Response): Promise<void> {
    // Validate consultation_id param
    const paramsSchema = z.object({
        consultation_id: z.preprocess((val) => typeof val === "string" ? parseInt(val, 10) : val, z.number().int())
    });
    const paramsResult = paramsSchema.safeParse(req.params);
    if (!paramsResult.success) {
        res.status(400).json({ message: "Invalid consultation_id" });
        return;
    }
    const consultationId = paramsResult.data.consultation_id;
    
    // Only doctors allowed
    if (req.decodedToken.role !== "doctor") {
        res.status(403).json({ message: "You're not authorized to create a prescription" });
        return;
    }
    
    // Validate request body
    const itemSchema = z.object({
        id: z.number().int(),
        dosage: z.string().min(1, "Dosage required"),
        frequency: z.string().min(1, "Frequency required"),
        duration: z.string().min(1, "Duration required"),
        note: z.string().optional()
    });
    const bodySchema = z.object({
        note: z.string().min(1, "Please provide consultation note"),
        medicines: z.array(itemSchema)
    });
    const bodyResult = bodySchema.safeParse(req.body);
    if (!bodyResult.success) {
        const errors = bodyResult.error.errors.map(err => ({
            field: err.path[0],
            error: err.message
        }));
        res.status(400).json({ message: "Validation failed", errors });
        return;
    }
    
    const input = {
        note: bodyResult.data.note,
        medicines: bodyResult.data.medicines
    };

    try {
        const result = await createPrescriptionService(req.decodedToken.userId, consultationId, input);
        res.status(200).json({
            message: "Prescription created successfully",
            data: result
        });
    } catch (error) {
        if (error instanceof InsufficientAuthorizationError) {
            res.status(403).json({ message: error.message });
            return;
        }
        
        if (error instanceof InsufficientStockError) {
            res.status(409).json({ message: error.message });
            return;
        }

        if (error instanceof NotFoundError) {
            res.status(404).json({ message: error.message });
            return;
        }

        console.error(error);
        res.status(500).json({ message: "Something went wrong." });
    }
}