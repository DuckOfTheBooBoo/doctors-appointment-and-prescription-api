export const consultationQueries = {
    create: `INSERT INTO consultations (user_id, schedule_id, booked_at) VALUES (?,?,?);`,
    getByIdAndUserId: `SELECT c.*, ds.doctor_id
    FROM consultations c
    JOIN doctor_schedules ds ON ds.id = c.schedule_id
    WHERE c.id = ? AND (c.user_id = ? OR ds.doctor_id = ?);`
};