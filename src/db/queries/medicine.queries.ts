export const medicineQueries = {
    create: `INSERT INTO medicines (name, stock) VALUES (?,?)`,
    updateStock: `UPDATE medicines SET stock = ? WHERE id = ?`,
    getById: `SELECT * FROM medicines WHERE id = ?`
    
};