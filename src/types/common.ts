export interface UserInput {
    prefix: string | null;
    suffix: string | null;
    first_name: string;
    last_name: string | null;
    date_of_birth: string;
    gender: "M" | "F";
    phone: string;
    address: string;
    email: string | null;
    password: string | null;
}

export interface LicenseInput {
    id: number | null;
    number: string;
    issuing_authority: string;
    issue_date: string;
    expiry_date: string;
    specialty: string | null;
}

export interface DoctorInput extends UserInput {
    specialization: string;
    license: LicenseInput;
}