export class User {
    // Properti id user, default null
    public id: number | null = null;
    // Properti prefix, default null
    public prefix: string | null = null;
    // Properti suffix, default null
    public suffix: string | null = null;
    // Nama depan user
    public firstName: string;
    // Nama belakang, bisa null
    public lastName: string | null;
    // Tanggal lahir
    public dateOfBirth: Date;
    // Gender, "M" atau "F"
    public gender: "M" | "F";
    // Nomor telepon
    public phone: string;
    // Email, default null
    public email: string | null = null;
    // Password, default null
    public password: string | null = null;
    // Alamat user
    public address: string;
    // Status aktif user
    public isActive: boolean;
    // Tanggal dibuat
    public createdAt: Date;
    // Tanggal diperbarui
    public updatedAt: Date;

    // Konstruktor untuk menginisialisasi User
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
        // Mengatur properti id
        this.id = id;
        // Mengatur properti prefix
        this.prefix = prefix;
        // Mengatur properti suffix
        this.suffix = suffix;
        // Mengatur nama depan
        this.firstName = firstName;
        // Mengatur nama belakang
        this.lastName = lastName;
        // Mengkonversi date_of_birth ke Date jika diperlukan
        this.dateOfBirth = dateOfBirth instanceof Date ? dateOfBirth : new Date(dateOfBirth);
        // Mengatur gender
        this.gender = gender;
        // Mengatur nomor telepon
        this.phone = phone;
        // Mengatur email
        this.email = email;
        // Mengatur password
        this.password = password;
        // Mengatur alamat
        this.address = address;
        // Mengatur status aktif
        this.isActive = isActive;
        // Mengatur tanggal pembuatan
        this.createdAt = createdAt;
        // Mengatur tanggal pembaruan
        this.updatedAt = updatedAt;
    }
}