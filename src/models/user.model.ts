import BaseModel from "./base.model";

export class User extends BaseModel {
    public id: number | null;
    public firstName: string;
    public lastName: string | null;
    public dateOfBirth: Date;
    public gender: "M" | "F";
    public phone: string;
    public email: string;
    public password: string;
    public address: string;
    public isActive: boolean;

    constructor(
        id: number | null,
        firstName: string,
        lastName: string | null,
        dateOfBirth: Date | string,
        gender: "M" | "F",
        phone: string,
        email: string,
        password: string,
        address: string
    ) {
        super();
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.dateOfBirth = dateOfBirth instanceof Date ? dateOfBirth : new Date(dateOfBirth);
        this.gender = gender;
        this.phone = phone;
        this.email = email;
        this.password = password;
        this.address = address;
        this.isActive = true;
    }


}