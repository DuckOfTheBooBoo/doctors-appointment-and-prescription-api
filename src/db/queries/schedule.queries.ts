export const scheduleQueries = {
    // Query untuk mengambil schedule berdasarkan doctor_id
    getByDoctorId: `SELECT * FROM schedules WHERE doctor_id = ?`,

    // Query to create a new schedule
    create: `INSERT INTO doctor_schedules (doctor_id, date, start_hour, end_hour) VALUES (?, ?, ?, ?)`
};