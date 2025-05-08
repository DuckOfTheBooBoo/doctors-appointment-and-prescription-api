import { License } from "./license.model";
import { User } from "./user.model";

export class Doctor extends User {
    public specialization: string;
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
        specialization: string,
        isActive: boolean,
        license: License
    ) {
        super(id, prefix, suffix, firstName, lastName, dateOfBirth, gender, phone, email, password, address, isActive);
        this.specialization = specialization;
        this.license = license;
    }
}