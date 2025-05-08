export class User {
    public id: number | null;
    public prefix: string | null;
    public suffix: string | null;
    public firstName: string;
    public lastName: string | null;
    public dateOfBirth: Date;
    public gender: "M" | "F";
    public phone: string;
    public email: string | null;
    public password: string | null;
    public address: string;
    public isActive: boolean;

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
        isActive: boolean
    ) {
        this.id = id;
        this.prefix = prefix;
        this.suffix = suffix;
        this.firstName = firstName;
        this.lastName = lastName;
        this.dateOfBirth = dateOfBirth instanceof Date ? dateOfBirth : new Date(dateOfBirth);
        this.gender = gender;
        this.phone = phone;
        this.email = email;
        this.password = password;
        this.address = address;
        this.isActive = isActive;
    }
}