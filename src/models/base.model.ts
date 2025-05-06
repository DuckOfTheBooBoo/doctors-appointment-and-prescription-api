export default class BaseModel {
    constructor() {}
    
    // public toJSON(): string {
    //     return JSON.stringify(this);
    // }

    public getAttributes(): any[] {
        return Object.values(this);
    }
}