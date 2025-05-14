export class PrescriptionItem {
    public prescription_id: number;
    public medicine_id: number;
    public dosage: string;
    public frequency: string;
    public duration: string;
    public notes: string | null;

    constructor(
        prescription_id: number,
        medicine_id: number,
        dosage: string,
        frequency: string,
        duration: string,
        notes: string | null = null
    ) {
        this.prescription_id = prescription_id;
        this.medicine_id = medicine_id;
        this.dosage = dosage;
        this.frequency = frequency;
        this.duration = duration;
        this.notes = notes;
    }
}