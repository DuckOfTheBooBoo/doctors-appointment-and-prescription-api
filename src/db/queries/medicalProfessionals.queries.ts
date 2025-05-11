export const medicalProfessionalsQueries = {
    // Query untuk mengambil semua medical professionals
    getAll: `SELECT * FROM medical_professionals`,
    // Query untuk mengambil medical professional berdasarkan id
    getById: `SELECT * FROM medical_professionals WHERE id = ?`,
    // Query untuk membuat record medical professional baru
    create: `INSERT INTO medical_professionals (id, role, specialization, license_id, status) VALUES (?,?,?,?,?);`
}