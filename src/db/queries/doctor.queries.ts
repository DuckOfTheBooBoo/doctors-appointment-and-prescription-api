export const doctorQueries = {
    getAll: `SELECT * FROM doctors`,
    getById: `SELECT * FROM doctors WHERE id = ?`,
    create: `INSERT INTO doctors (id, specialization, license_id, status) VALUES (?, ?,?,?);`
}