import { License } from "./license.model";
import { User } from "./user.model";

export class MedicalProfessional extends User {
    public role: "pharmacist" | "doctor";
    public specialization: string | null = null;
    public license: License;

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
        role: "pharmacist" | "doctor",
        specialization: string | null,
        license: License
    ) {
        super(id, prefix, suffix, firstName, lastName, dateOfBirth, gender, phone, email, password, address, isActive);
        this.role = role;
        this.specialization = specialization;
        this.license = license;
    }
}