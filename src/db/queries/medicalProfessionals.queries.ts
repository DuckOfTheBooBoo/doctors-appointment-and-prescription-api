export const medicalProfessionalsQueries = {
    getAll: `SELECT * FROM medical_professionals`,
    getById: `SELECT * FROM medical_professionals WHERE id = ?`,
    create: `INSERT INTO medical_professionals (id, role, specialization, license_id, status) VALUES (?,?,?,?,?);`
}