export const medicalProfessionalsQueries = {
    // Query untuk mengambil semua medical professionals
    getAll: `SELECT * FROM medical_professionals`,
    // Query untuk mengambil medical professional berdasarkan id
    getById: `SELECT * FROM medical_professionals WHERE id = ?`,
    // Query untuk membuat record medical professional baru
    create: `INSERT INTO medical_professionals (id, role, specialization, license_id, status) VALUES (?,?,?,?,?);`,
    // Query untuk mengambil doctors dengan pagination
    getDoctors: `SELECT u.id, prefix, suffix, first_name, last_name, specialization 
        FROM medical_professionals 
        JOIN users u ON medical_professionals.id = u.id 
        WHERE role = 'doctor' AND specialization = COALESCE(?, specialization)
        LIMIT ? OFFSET ?;`,
    // New key: get doctor details using users and medical_professionals tables
    getDoctorDetails: `SELECT u.id, u.prefix, u.first_name, u.last_name, u.suffix, u.email, mp.specialization 
        FROM users u 
        JOIN medical_professionals mp ON u.id = mp.id 
        WHERE u.id = ? AND mp.role = 'doctor'`,
    deactivate: `UPDATE medical_professionals SET status = 'inactive' WHERE id = ?`,
};