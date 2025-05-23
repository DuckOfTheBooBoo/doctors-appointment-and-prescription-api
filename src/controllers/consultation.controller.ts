import { Request , Response } from "express";
import { z } from "zod";
import { createConsultationService, getConsultation, getConsultationsForDoctor } from "@/services/consultation.service";
import { createPrescriptionService } from "@/services/consultation.service";
import { DuplicateError, InsufficientAuthorizationError, InsufficientStockError, NotFoundError } from "@/errors";

/**
 * @swagger
 * /consultations:
 *   post:
 *     summary: Create a new appointment (User)
 *     tags: [Consultation]
 *     security:
 *       - JWTAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               schedule_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Consultation created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: "#/components/schemas/Consultation"
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
 *       409:
 *         description: Duplicate consultation.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ConflictResponse"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/InternalErrorResponse"
 */

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

/**
 * @swagger
 * /consultations/{consultation_id}/summary:
 *   get:
 *     summary: Get consultation summary.
 *     tags: [Consultation]
 *     security:
 *       - JWTAuth: []
 *     parameters:
 *       - name: consultation_id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Summary retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: "#/components/schemas/Consultation"
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
 *         description: Consultation not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *                  properties:
 *                      message:
 *                          type: string
 *                          example: "Consultation not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/InternalErrorResponse"
 */

export async function getConsultationSummary(req: Request, res: Response) {

    const paramsSchema = z.object({
        consultation_id: z.preprocess((val) => typeof val === "string" ? parseInt(val, 10) : val, z.number().int())
    });

    const valResult = paramsSchema.safeParse(req.params);

    if (!valResult.success) {
        const errors = valResult.error.errors.map(err => ({
            field: err.path[0],
            error: err.message
        }));
        res.status(400).json({
            message: "Validation failed",
            errors
        })
        return;
    }

    try {
        const consultationSummary = await getConsultation(
            valResult.data.consultation_id,
            req.decodedToken.userId,
            req.decodedToken.role
        );

        res.status(200).json({
            message: consultationSummary.prescription ? "Consultation ended" : "Consultation ongoing",
            data: consultationSummary
        })
        return;
    } catch (error) {
        if (error instanceof InsufficientAuthorizationError) {
            res.status(403).json({
                message: "You're not authorized to make this request"
            });
            return;
        }

        if (error instanceof NotFoundError) {
            res.status(404).json({
                message: "Consultation not found"
            });
            return;
        }

        console.error(error);
        res.status(500).json({
            messsage: "Something went wrong."
        });
        return;
    }


}



/**
 * @swagger
 * /consultations/{consultation_id}:
 *   post:
 *     summary: Create prescription for consultation (for doctor).
 *     tags: [Consultation]
 *     security:
 *       - JWTAuth: []
 *     parameters:
 *       - name: consultation_id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               note:
 *                 type: string
 *                 example: Patient needs rest and hydration
 *               medicines:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 101
 *                     dosage:
 *                       type: string
 *                       example: 500mg
 *                     frequency:
 *                       type: string
 *                       example: 3x a day
 *                     duration:
 *                       type: string
 *                       example: 5 days
 *                     note:
 *                       type: string
 *                       example: After meals
 *     responses:
 *       200:
 *         description: Prescription created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     prescriptionId:
 *                       type: integer
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
 *         description: Consultation or medicine not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/NotFoundResponse"
 *       409:
 *         description: Insufficient stock.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  message:
 *                    type: string
 *                    example: "Failed to decrease stock for medicine id"
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/InternalErrorResponse"
 */

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
};

/**
 * @swagger
 * /consultations/doctor:
 *   get:
 *     summary: Retrieve consultations for a doctor.
 *     security:
 *       - JWTAuth: []
 *     tags: [Consultation]
 *     parameters:
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *         required: false
 *     responses:
 *       200:
 *         description: Consultations retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Consultation"
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
export async function getDoctorConsultations(req: Request, res: Response) {
	// Only doctors can request this
	if (req.decodedToken.role !== "doctor") {
		res.status(403).json({
			message: "You're not authorized to make this request"
		});
		return;
	}
	
	// Optional filter: "done" or "pending"
	const filter = req.query.filter as string | undefined;
	try {
		const consultations = await getConsultationsForDoctor(req.decodedToken.userId, filter);
		res.status(200).json({
			message: "Consultations retrieved successfully",
			data: consultations
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Something went wrong." });
	}
}