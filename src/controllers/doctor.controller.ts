// Mengimpor fungsi service untuk membuat doctor
import { NotFoundError } from "@/errors";
import { addDoctorScheduleService, createDoctorService, deactivateMedicalProfessionalService, getDoctorDetailsService, getDoctorsService, updateDoctorScheduleService } from "@/services/doctor.service";
// Mengimpor tipe DoctorInput
import { DoctorInput } from "@/types/common";
// Mengimpor tipe Request dan Response dari express
import type { Request, Response } from "express";
// Mengimpor modul zod untuk validasi
import { z } from "zod";

export async function createDoctor(req: Request, res: Response) {
    // Mendefinisikan schema validasi untuk data license doctor
    const licenseSchema = z.object({
        number: z.string().min(1, "Please provide license's number"),
        issuing_authority: z.string().min(1, "Please provide license issuing authority"),
        issue_date: z.string().min(1, "Please provide license issue date").date("Date format is incorrect (YYYY-MM-DD)"),
        expiry_date: z.string().min(1, "Please provide license expiry date").date("Date format is incorrect (YYYY-MM-DD)").refine(val => new Date(val) > new Date(), "License expired"),
        specialty: z.string().min(1, "Please provide specialty")
    });
    
    // Mendefinisikan schema validasi untuk doctor
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
        email: z.string().min(1, "Please provide email.").email('Invalid email format'),
        address: z.string().min(1, "Please provide address."),
        specialization: z.string().min(1, "Please provide specialization"),
        license: licenseSchema
    });

    // Validasi request body
    const result = validationSchema.safeParse(req.body);

    if (!result.success) {
        // Mapping error validasi dan mengirim response 400
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

    // Jika specialty license dan specialization tidak cocok, kirim error
    if (req.body.license.specialty !== req.body.specialization) {
        res.status(400).json({
            message: "Validation failed",
            errors: [
                { field: "specialization", error: "License's specialty and specialization didn't match" }
            ]
        })
        return;
    }

    // Set prefix/suffix ke null bila tidak diberikan
    if (!req.body.prefix) {
        req.body.prefix = null;
    }
    if (!req.body.suffix) {
        req.body.suffix = null;
    }

    try {
        // Memanggil service untuk membuat doctor baru
        await createDoctorService(req.body as DoctorInput);
        // Mengirim response 201 bahwa account telah dibuat dan menunggu persetujuan admin
        res.status(201).json({
            message: "Account creation successful. Please wait for admin approval to proceed.",
        });

    } catch (error) {
        // Mencetak error dan mengirim response 500 jika terjadi kesalahan
        console.error(error)
        res.status(500).json({
            message: "Something went wrong."
        });
        return;
    }
    return;
}

export async function getDoctors(req: Request, res: Response) {
    const { page = 1, limit = 10, specialization } = req.query;

    try {
        const doctors = await getDoctorsService(Number(page), Number(limit), specialization ? specialization as string : null);
        res.status(200).json(doctors);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Something went wrong."
        });
    }
}

export async function addSchedule(req: Request, res: Response): Promise<void> {
    // Mengambil doctor_id dari route parameter
    const { doctor_id } = req.params;

    // Mendeifinisikan schema zod untuk validasi doctor_id
    const paramsSchema = z.object({
        doctor_id: z.preprocess((val) => {
            if (typeof val === "string") {
                return parseInt(val, 10);
            }
            return val;
        }, z.number().int())
    });
    
    const paramsResult = paramsSchema.safeParse(req.params);
    if (!paramsResult.success) {
        const errors = paramsResult.error.errors.map(error => ({
            field: error.path[0],
            error: error.message
        }));

        res.status(400).json({
            message: "Validation",
            errors
        });
        return;
    }

    // Cek apakah id yang berada di dalam token sama dengan parameter doctor_id
    if (paramsResult.data.doctor_id !== req.decodedToken.userId) {
        res.status(403).json({
            message: "You're not authorized to make this request"
        });
        return;
    }

    // Define validation schema for the schedule
    const scheduleSchema = z.object({
        date: z.string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, "Date format is incorrect (YYYY-MM-DD)")
            .refine((date) => {
                const today = new Date();
                const inputDate = new Date(date);
                today.setHours(0, 0, 0, 0); // Normalize to midnight for comparison
                return inputDate >= today;
            }, "Date must be today or in the future"),
        start_hour: z.number()
            .min(0, "Start hour must be between 0 and 23")
            .max(23, "Start hour must be between 0 and 23"),
        end_hour: z.number()
            .min(0, "End hour must be between 0 and 23")
            .max(23, "End hour must be between 0 and 23")
    }).refine((data) => data.end_hour > data.start_hour, {
        message: "End hour must be greater than start hour",
        path: ["end_hour"] // indicates which field the error is associated with
    });

    // Validate request body
    const result = scheduleSchema.safeParse(req.body);

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
        // Call service to add the schedule
        const schedule = await addDoctorScheduleService(Number(doctor_id), req.body);
        res.status(201).json({
            message: "Schedule added successfully",
            data: schedule
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Something went wrong."
        });
    }
}

export async function updateSchedule(req: Request, res: Response): Promise<void> {
    // Validate route parameters: doctor_id and schedule_id
    const paramsSchema = z.object({
        doctor_id: z.preprocess((val) => typeof val === "string" ? parseInt(val, 10) : val, z.number().int()),
        schedule_id: z.preprocess((val) => typeof val === "string" ? parseInt(val, 10) : val, z.number().int())
    });
    const paramsResult = paramsSchema.safeParse(req.params);
    if (!paramsResult.success) {
        const errors = paramsResult.error.errors.map(error => ({
            field: error.path[0],
            error: error.message
        }));
        res.status(400).json({ message: "Validation failed", errors });
        return;
    }
    const { doctor_id, schedule_id } = paramsResult.data;
    
    // Ensure the doctor updating the schedule matches the logged in user
    if (doctor_id !== req.decodedToken.userId) {
        res.status(403).json({ message: "You're not authorized to update this schedule" });
        return;
    }
    
    // Validate request body using similar schema from addSchedule
    const scheduleSchema = z.object({
        date: z.string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, "Date format is incorrect (YYYY-MM-DD)")
            .refine((date) => {
                const today = new Date();
                const inputDate = new Date(date);
                today.setHours(0, 0, 0, 0);
                return inputDate >= today;
            }, "Date must be today or in the future"),
        start_hour: z.number()
            .min(0, "Start hour must be between 0 and 23")
            .max(23, "Start hour must be between 0 and 23"),
        end_hour: z.number()
            .min(0, "End hour must be between 0 and 23")
            .max(23, "End hour must be between 0 and 23")
    }).refine(data => data.end_hour > data.start_hour, {
        message: "End hour must be greater than start hour",
        path: ["end_hour"]
    });
    const bodyResult = scheduleSchema.safeParse(req.body);
    if (!bodyResult.success) {
        const errors = bodyResult.error.errors.map(error => ({
            field: error.path[0],
            error: error.message
        }));
        res.status(400).json({ message: "Validation failed", errors });
        return;
    }
    
    try {
        const updatedSchedule = await updateDoctorScheduleService(doctor_id, schedule_id, req.body);
        res.status(200).json({
            message: "Schedule updated successfully",
            data: updatedSchedule
        });
    } catch (error) {
        console.error(error);
        if (error instanceof NotFoundError) {
            res.status(404).json({ message: error.message });
            return;
        }
        res.status(500).json({ message: "Something went wrong." });
    }
}

export async function getDoctorDetails(req: Request, res: Response) {
    const { doctor_id } = req.params;
    const doctorId = parseInt(doctor_id, 10);
    if (isNaN(doctorId)) {
        res.status(400).json({
            message: "Validation failed",
            errors: [
                { field: "doctor_id", message: "doctor_id should be a number" } 
            ]
        });
        return;
    }
    // Optional query parameters for date range in YYYY-MM-DD format
    const { start_date, end_date } = req.query;
    try {
        const details = await getDoctorDetailsService(doctorId, start_date as string | undefined, end_date as string | undefined);
        res.status(200).json({
            message: null,
            data: details
        });
    } catch (error) {

        if (error instanceof NotFoundError) {
            res.status(404).json({
                message: "Doctor not found"
            });
            return;
        }

        console.error(error);
        res.status(500).json({
            message: "Something went wrong."
        });
    }
}

export async function deactivateDoctor(req: Request, res: Response) {
    const { doctor_id } = req.params;
    const doctorId = parseInt(doctor_id, 10);
    if (isNaN(doctorId)) {
        res.status(400).json({
            message: "Validation failed",
            errors: [
                { field: "doctor_id", message: "doctor_id should be a number" } 
            ]
        });
        return;
    }

    try {
        // Call service to deactivate the doctor
        await deactivateMedicalProfessionalService(doctorId);
        res.status(200).json({
            message: "Doctor deactivated successfully"
        });
    } catch (error) {
        console.error(error);
        if (error instanceof NotFoundError) {
            res.status(404).json({
                message: error.message
            });
            return;
        }
        res.status(500).json({
            message: "Something went wrong."
        });
    }
}