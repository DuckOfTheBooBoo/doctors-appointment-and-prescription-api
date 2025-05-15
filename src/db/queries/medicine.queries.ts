export const medicineQueries = {
    create: `INSERT INTO medicines (name, stock) VALUES (?,?)`,
    updateStock: `UPDATE medicines SET stock = ? WHERE id = ?`,
    getById: `SELECT * FROM medicines WHERE id = ?`,
    decreaseStock: 'UPDATE medicines SET stock = stock - 1 WHERE id = ? AND stock > 0',
    delete: `DELETE FROM medicines WHERE id = ?`
};