// Mengimpor koneksi database
import { db } from "@/db";
// Mengimpor query license
import { licenseQueries } from "@/db/queries/license.queries";
// Mengimpor query medical professionals
import { medicalProfessionalsQueries } from "@/db/queries/medicalProfessionals.queries";
import { scheduleQueries } from "@/db/queries/schedule.queries";
// Mengimpor query user
import { userQueries } from "@/db/queries/user.queries";
// Mengimpor model License
import { License } from "@/models/license.model";
// Mengimpor model MedicalProfessional
import { MedicalProfessional } from "@/models/medicalProfessional.model";
import { Schedule } from "@/models/schedule.model";
// Mengimpor tipe input DoctorInput dari "@/types/common"
import { DoctorInput } from "@/types/common";
// Mengimpor tipe ResultSetHeader dan PoolConnection
import { type ResultSetHeader, type PoolConnection, RowDataPacket } from "mysql2/promise";
import { NotFoundError } from "@/errors";

// Fungsi untuk membuat doctor baru
export async function createDoctorService(body: DoctorInput): Promise<MedicalProfessional> {
    // Destruktur properti yang diperlukan dari body
    const { prefix, suffix, first_name, last_name, date_of_birth, gender, phone, email, address } = body;
    // Membuat instance License baru untuk doctor
    const newLicense = new License(body.license);
    // Membuat instance MedicalProfessional baru dengan role "doctor" dan spesialisasi
    const newDoctor = new MedicalProfessional(
        null,
        prefix,
        suffix,
        first_name,
        last_name,
        date_of_birth,
        gender,
        phone,
        email,
        null,
        address,
        false,
        new Date(),
        new Date(),
        "doctor",
        body.specialization,
        newLicense
    );

    try {
        // Memulai transaksi database
        await db.transaction(async (connection: PoolConnection) => {

            // Membuat record user untuk doctor
            const [userRes] = await connection.execute<ResultSetHeader>(userQueries.create, [
                newDoctor.prefix,
                newDoctor.suffix,
                newDoctor.firstName,
                newDoctor.lastName,
                newDoctor.dateOfBirth,
                newDoctor.gender,
                newDoctor.phone,
                null,
                null,
                newDoctor.address,
                false
            ]);
            // Update id doctor dari hasil insert ke table user
            newDoctor.id = userRes.insertId;
    
            // Membuat record license untuk doctor
            const [licenseRes] = await connection.execute<ResultSetHeader>(licenseQueries.create, [
                newLicense.number,
                newLicense.issuingAuthority,
                newLicense.issueDate,
                newLicense.expiryDate,
                newLicense.specialty
            ]);
            // Update id license pada objek doctor
            newDoctor.license.id = licenseRes.insertId;
    
            // Membuat record medical professional untuk doctor
            await connection.execute<ResultSetHeader>(medicalProfessionalsQueries.create, [
                newDoctor.id,
                newDoctor.role,
                newDoctor.specialization,
                newDoctor.license.id,
                'pending'
            ]);
            
            return true;
        });
        // Mengembalikan objek doctor yang baru dibuat
        return newDoctor;
    } catch (error) {
        // Melempar ulang error jika terjadi kesalahan
        throw error;
    }
}

interface DoctorsQuery extends RowDataPacket {
    id: number;
    prefix: string | null;
    suffix: string | null;
    first_name: string;
    last_name: string | null;
    specialization: string;
}

// Fungsi untuk mendapatkan daftar doctors dengan pagination
export async function getDoctorsService(page: number, limit: number, specialty: string | null = null) {
    const offset = (page - 1) * limit;

    try {
        const rows = await db.query<DoctorsQuery[]>(medicalProfessionalsQueries.getDoctors, [specialty, limit, offset]);
        return rows;
    } catch (error) {
        throw error;
    }
}

export async function addDoctorScheduleService(doctorId: number, body: { date: string; start_hour: number; end_hour: number }): Promise<Schedule> {
    const { date, start_hour, end_hour } = body;

    try {
        const result = await db.execute(scheduleQueries.create, [doctorId, date, start_hour, end_hour]);
        const scheduleId = result.insertId;

        return new Schedule(scheduleId, doctorId, new Date(date), start_hour, end_hour);
    } catch (error) {
        throw error;
    }
}

export async function updateDoctorScheduleService(doctorId: number, scheduleId: number, body: { date: string; start_hour: number; end_hour: number }): Promise<Schedule> {
    try {
        const result = await db.execute(
            scheduleQueries.update,
            [body.date, body.start_hour, body.end_hour, scheduleId, doctorId]
        );
        if (result.affectedRows === 0) {
            throw new NotFoundError("Schedule not found or unauthorized");
        }
        const rows = await db.query<any[]>(scheduleQueries.getById, [scheduleId]);
        const scheduleRow = rows[0];
        return new Schedule(scheduleRow.id, scheduleRow.doctor_id, new Date(scheduleRow.date), scheduleRow.start_hour, scheduleRow.end_hour);
    } catch (error) {
        throw error;
    }
}

interface DoctorInfoRow extends RowDataPacket {
    id: number;
    prefix: string | null;
    first_name: string;
    last_name: string | null;
    suffix: string | null;
    email: string;
    specialization: string;
}

interface ScheduleRow extends RowDataPacket {
    id: number;
    doctor_id: number;
    date: Date;
    start_hour: number;
    end_hour: number;
}

export async function getDoctorDetailsService(doctorId: number, startDate?: string, endDate?: string) {
    // Default dates to today if not provided in YYYY-MM-DD format
    const today = new Date();
    const defaultDate = today.toISOString().substring(0, 10);
    const start = startDate || defaultDate;
    const end = endDate || defaultDate;

    // Use the query from medicalProfessionalsQueries
    const doctorRows = await db.query<DoctorInfoRow[]>(medicalProfessionalsQueries.getDoctorDetails, [doctorId]);
    if (doctorRows.length === 0) {
        throw new NotFoundError("Doctor not found");
    }

    const doctor = doctorRows[0];
    const fullName = `${doctor.prefix ? doctor.prefix + " " : ""}${doctor.first_name}${doctor.last_name ? " " + doctor.last_name : ""}${doctor.suffix ? " " + doctor.suffix : ""}`.trim();

    const scheduleRows = await db.query<ScheduleRow[]>(scheduleQueries.getByDateRange, [doctorId, start, end]);

    return {
        id: doctor.id,
        full_name: fullName,
        email: doctor.email,
        specialization: doctor.specialization,
        schedules: scheduleRows
    };
}

export async function deactivateMedicalProfessionalService(medProfId: number): Promise<void> {
    try {
        await db.transaction(async (connection: PoolConnection) => {
            await connection.execute(medicalProfessionalsQueries.deactivate, [medProfId]);
            await connection.execute(userQueries.deactivate, [medProfId]);
        });
    } catch (error) {
        throw error;
    }
}