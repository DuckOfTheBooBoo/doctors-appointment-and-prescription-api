export const userQueries = {
    // Query untuk mengambil user berdasarkan email jika aktif
    getByEmail: `SELECT * FROM users WHERE email = ? AND is_active = 1`,
    // Query untuk membuat record user baru
    create: `INSERT INTO users (prefix, suffix, first_name, last_name, date_of_birth, gender, phone, email, password, address, is_active) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    // Query untuk menghapus user berdasarkan id
    delete: `DELETE FROM users WHERE id = ?`
};