export const userQueries = {
    getByEmail: `SELECT * FROM users WHERE email = ? AND is_active = 1`,
    create: `INSERT INTO users (prefix, suffix, first_name, last_name, date_of_birth, gender, phone, email, password, address, is_active) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    delete: `DELETE FROM users WHERE id = ?`
};