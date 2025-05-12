export const scheduleQueries = {
    // Query untuk mengambil schedule berdasarkan doctor_id
    getByDoctorId: `SELECT * FROM schedules WHERE doctor_id = ?`,

    // Query to create a new schedule
    create: `INSERT INTO doctor_schedules (doctor_id, date, start_hour, end_hour) VALUES (?, ?, ?, ?)`,
    // New key: get doctor's schedules within a date range
    getByDateRange: `SELECT id, date, start_hour, end_hour 
        FROM doctor_schedules 
        WHERE doctor_id = ? AND date BETWEEN ? AND ? 
        ORDER BY date, start_hour`
};