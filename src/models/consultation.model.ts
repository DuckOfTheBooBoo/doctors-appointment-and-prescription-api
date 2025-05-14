import { Prescription } from "./prescription.model";

export class Consultation {
    public id: number;
    public userId: number;
    public scheduleId: number;
    public bookedAt: Date;
    public note: string | null;
    public prescription: Prescription | null;

    constructor(id: number, userId: number, scheduleId: number, bookedAt: Date, note: string | null = null, medicines: Prescription | null = null) {
        this.id = id;
        this.userId = userId;
        this.scheduleId = scheduleId;
        this.bookedAt = bookedAt;
        this.note = note;
        this.prescription = medicines;
    }
}
