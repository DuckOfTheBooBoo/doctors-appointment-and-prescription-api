export const userQueries = {
    // Query untuk mengambil user berdasarkan email jika aktif
    getByEmail: `SELECT * FROM users WHERE email = ? AND is_active = 1`,
    getById: `SELECT * FROM users WHERE id = ? AND is_active = 1`,
    // Query untuk membuat record user baru
    create: `INSERT INTO users (prefix, suffix, first_name, last_name, date_of_birth, gender, phone, email, password, address, is_active) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    // Query untuk menghapus user berdasarkan id
    deactivate: `UPDATE users SET is_active = 0 WHERE id = ?`
};