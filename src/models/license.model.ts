// Mengimpor tipe LicenseInput dari "@/types/common"
import { LicenseInput } from "@/types/common";

export class License {
    // Id license, default null
    public id: number | null;
    // Nomor license
    public number: string;
    // Otoritas yang mengeluarkan license
    public issuingAuthority: string;
    // Tanggal penerbitan license
    public issueDate: Date;
    // Tanggal kadaluarsa license
    public expiryDate: Date;
    // Spesialisasi terkait license, bisa null
    public specialty: string | null;

    // Konstruktor yang menerima data LicenseInput dan mengkonversi tanggal
    constructor(data: LicenseInput) {
        this.id = data.id;
        this.number = data.number;
        this.issuingAuthority = data.issuing_authority;
        this.issueDate = new Date(data.issue_date);
        this.expiryDate = new Date(data.expiry_date);
        this.specialty = data.specialty;
    }
}