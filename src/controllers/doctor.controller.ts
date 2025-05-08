import { createDoctorService } from "@/services/doctor.service";
import { DoctorInput } from "@/types/common";
import type { Request, Response } from "express";
import { z } from "zod";

export async function createDoctor(req: Request, res: Response) {
    const licenseSchema = z.object({
        number: z.string().min(1, "Please provide license's number"),
        issuing_authority: z.string().min(1, "Please provide license issuing authority"),
        issue_date: z.string().min(1, "Please provide license issue date").date("Date format is incorrect (YYYY-MM-DD)"),
        expiry_date: z.string().min(1, "Please provide license expiry date").date("Date format is incorrect (YYYY-MM-DD)").refine(val => new Date(val) > new Date(), "License expired"),
        specialty: z.string().min(1, "Please provide specialty")
    });
    
    const validationSchema = z.object({
        first_name: z.string().min(1, "Please provide first name."),
        date_of_birth: z.string()
            .min(1, "Please provide date of birth.")
            .date("Date format is incorrect (YYYY-MM-DD)"),
        gender: z.string()
            .min(1, "Please provide gender.")
            .refine(val => ['M', 'F'].includes(val), "Gender must be M or F"),
        phone: z.string()
            .min(1, "Please provide phone number.")
            .regex(/^\+?[1-9]\d{1,14}$/, "Phone number format is invalid"),
        address: z.string().min(1, "Please provide address."),
        specialization: z.string().min(1, "Please provide specialization"),
        license: licenseSchema
    });

    const result = validationSchema.safeParse(req.body);

    if (!result.success) {
        const errors = result.error.errors.map(error => ({
            field: error.path[0],
            error: error.message
        }));

        res.status(400).json({
            message: "Validation failed",
            errors
        });
        return;
    }

    if (req.body.license.specialty !== req.body.specialization) {
        res.status(400).json({
            message: "Validation failed",
            errors: [
                { field: "specialization", error: "License's specialty and specialization didn't match" }
            ]
        })
    }

    if (!req.body.prefix) {
        req.body.prefix = null;
    }

    if (!req.body.suffix) {
        req.body.suffix = null;
    }

    try {
        await createDoctorService(req.body as DoctorInput);
        res.status(201).json({
            message: "Account creation successful. Please wait for admin approval to proceed.",
        });

    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: "Something went wrong."
        });
        return;
    }
    return;
}