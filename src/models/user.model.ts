export class User {
    public id: number | null = null;
    public prefix: string | null = null;
    public suffix: string | null = null;
    public firstName: string;
    public lastName: string | null;
    public dateOfBirth: Date;
    public gender: "M" | "F";
    public phone: string;
    public email: string | null = null;
    public password: string | null = null;
    public address: string;
    public isActive: boolean;
    public createdAt: Date;
    public updatedAt: Date;

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
        isActive: boolean,
        createdAt: Date,
        updatedAt: Date
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
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}