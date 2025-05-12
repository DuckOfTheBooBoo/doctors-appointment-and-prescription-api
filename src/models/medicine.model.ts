export class Medicine {
    public id: number | null;
    public name: string;
    public stock: number;

    constructor(id: number | null, name: string, stock: number) {
        this.id = id;
        this.name = name;
        this.stock = stock;
    }
}