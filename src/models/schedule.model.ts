export class Schedule {
    public id: number;
    public doctorId: number;
    public date: Date;
    public startHour: number;
    public endHour: number;

    constructor(id: number, doctorId: number, date: Date, startHour: number, endHour: number) {
        this.id = id;
        this.doctorId = doctorId;
        this.date = date;
        this.startHour = startHour;
        this.endHour = endHour;
    }
}
