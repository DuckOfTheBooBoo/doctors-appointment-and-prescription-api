// Mengimpor model License
import { License } from "./license.model";
// Mengimpor model User sebagai parent class
import { User } from "./user.model";

export class MedicalProfessional extends User {
    // Mendefinisikan properti role dengan nilai "pharmacist" atau "doctor"
    public role: "pharmacist" | "doctor";
    // Properti spesialisasi, default null
    public specialization: string | null = null;
    // Properti license yang bertipe License
    public license: License;

    // Konstruktor untuk menginisialisasi objek MedicalProfessional
    constructor(
        id: number | null,
        prefix: string | null,
        suffix: string | null,
        firstName: string,
        lastName: string | null,
        dateOfBirth: Date | string,
        gender: "M" | "F",
        phone: string,
        email: string | null,
        password: string | null,
        address: string,
        isActive: boolean = false,
        createdAt: Date,
        updatedAt: Date,
        role: "pharmacist" | "doctor",
        specialization: string | null,
        license: License
    ) {
        // Memanggil konstruktor parent class User
        super(id, prefix, suffix, firstName, lastName, dateOfBirth, gender, phone, email, password, address, isActive, createdAt, updatedAt);
        // Mengatur properti role
        this.role = role;
        // Mengatur properti spesialisasi
        this.specialization = specialization;
        // Mengatur properti license
        this.license = license;
    }
}