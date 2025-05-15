// Interface untuk input data user
export interface UserInput {
    prefix: string | null;
    suffix: string | null;
    first_name: string;
    last_name: string | null;
    date_of_birth: string;
    gender: "M" | "F";
    phone: string;
    address: string;
    email: string;
    password: string | null;
}

// Interface untuk input data license
export interface LicenseInput {
    id: number | null;
    number: string;
    issuing_authority: string;
    issue_date: string | Date;
    expiry_date: string | Date;
    status: "active" | "inactive";
    specialty: string | null;
}

// Interface untuk input data khusus doctor yang meng-extend UserInput
export interface DoctorInput extends UserInput {
    specialization: string;
    license: LicenseInput;
}

// Interface untuk input data khusus pharmacist yang meng-extend UserInput
export interface PharmacistInput extends UserInput {
    license: LicenseInput;
}

// Interface tambahan untuk error khusus pada database MySQL
export interface MySQLError extends Error {
    code: string;
    errno: number;
    fatal: boolean;
    sql: string;
    sqlState: string;
    sqlMessage: string;
}