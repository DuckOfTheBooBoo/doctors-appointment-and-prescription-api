export const userQueries = {
    create: `INSERT INTO users (first_name, last_name, date_of_birth, gender, phone, email, password, address, is_active) VALUES (?,?,?,?,?,?,?,?,?)`
};