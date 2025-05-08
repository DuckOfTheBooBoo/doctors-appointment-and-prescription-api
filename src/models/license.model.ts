import { LicenseInput } from "@/types/common";

export class License {
    public id: number | null;
    public number: string;
    public issuingAuthority: string;
    public issueDate: Date;
    public expiryDate: Date;
    public specialty: string | null;

    constructor(data: LicenseInput) {
        this.id = data.id;
        this.number = data.number;
        this.issuingAuthority = data.issuing_authority;
        this.issueDate = new Date(data.issue_date);
        this.expiryDate = new Date(data.expiry_date);
        this.specialty = data.specialty;
    }
}