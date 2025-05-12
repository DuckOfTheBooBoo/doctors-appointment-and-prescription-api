export class Consultation {
    public id: number;
    public userId: number;
    public scheduleId: number;
    public bookedAt: Date;
    public note: string | null;

    constructor(id: number, userId: number, scheduleId: number, bookedAt: Date, note: string | null = null) {
        this.id = id;
        this.userId = userId;
        this.scheduleId = scheduleId;
        this.bookedAt = bookedAt;
        this.note = note;
    }
}
