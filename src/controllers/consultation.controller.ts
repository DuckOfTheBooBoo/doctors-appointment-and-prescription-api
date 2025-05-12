import { Request, Response } from "express";
import { z } from "zod";
import { createConsultationService } from "@/services/consultation.service";
import { DuplicateError } from "@/errors";

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