import { InvalidCredentialsError } from "@/errors";
import { loginService } from "@/services/auth.service";
import type { Request, Response } from "express";
import { z } from "zod";

export async function login(req: Request, res: Response) {   
    // Non-nullable fields check
    const validationSchema = z.object({
        email: z.string()
            .min(1, "Please provide email")
            .email("Invalid email format"),
        password: z.string()
            .min(1, "Please provide password")
            .min(8, "Password must be at least 8 characters"),
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

    try {
        const token = await loginService(req.body.email, req.body.password);

        res.status(200).json({
            message: "Login successful",
            data: {
                token
            },
            next: {
            }
        })
        return;
    } catch (error) {
        if (error instanceof InvalidCredentialsError) {
            res.status(401).json({
                message: error.message
            });
            return;
        }

        console.error(error);
        res.status(500).json({
            message: "Something went wrong. Please try again later."
        });
    }
}