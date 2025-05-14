import { PrescriptionItem } from "./prescription_item.model";

export class Prescription {
    id: number | null;
    items: PrescriptionItem[];
    issuedAt: Date;

    constructor(id: number | null = null, items: PrescriptionItem[] = [], issuedAt: Date = new Date()) {
        this.id = id;
        this.items = items;
        this.issuedAt = issuedAt;
    }
}