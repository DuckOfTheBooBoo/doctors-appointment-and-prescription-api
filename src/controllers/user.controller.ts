import { User } from '@/models/user.model';
import { createUserService } from '@/services/user.service';
import type { Request, Response } from 'express';
import { z } from 'zod';

export async function createNewUser(req: Request, res: Response): Promise<void> {
    // Non-nullable fields check
    const validationSchema = z.object({
        first_name: z.string().min(1, "Please provide first name."),
        date_of_birth: z.string()
            .min(1, "Please provide date of birth.")
            .regex(/^\d{4}-\d{2}-\d{2}$/, "Date format is incorrect (YYYY-MM-DD)"),
        gender: z.string()
            .min(1, "Please provide gender.")
            .refine(val => ['M', 'F'].includes(val), "Gender must be M or F"),
        email: z.string()
            .min(1, "Please provide email")
            .email("Invalid email format"),
        password: z.string()
            .min(1, "Please provide password")
            .min(8, "Password must be at least 8 characters"),
        phone: z.string()
            .min(1, "Please provide phone number.")
            .regex(/^\+?[1-9]\d{1,14}$/, "Phone number format is invalid"),
        address: z.string().min(1, "Please provide address.")
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
        const newUser: User = await createUserService(req.body);
        
        res.status(201).json({
            message: "Account creation successful",
            data: newUser,
            errors: null,
            next: {
                login: "/auth/login"
            }
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