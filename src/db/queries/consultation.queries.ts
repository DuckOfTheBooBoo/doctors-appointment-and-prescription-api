export const consultationQueries = {
    create: `INSERT INTO consultations (user_id, schedule_id, booked_at) VALUES (?,?,?);`,
    getByIdAndUserId: `SELECT c.*, ds.doctor_id
    FROM consultations c
    JOIN doctor_schedules ds ON ds.id = c.schedule_id
    WHERE c.id = ? AND (c.user_id = ? OR ds.doctor_id = ?);`,
    // New keys for doctor consultations
    getByDoctorAll: `
        SELECT c.*, ds.doctor_id, p.id as prescriptionId
        FROM consultations c
        JOIN doctor_schedules ds ON ds.id = c.schedule_id
        LEFT JOIN prescriptions p ON p.consultation_id = c.id
        WHERE ds.doctor_id = ?
    `,
    getByDoctorDone: `
        SELECT c.*, ds.doctor_id, p.id as prescriptionId
        FROM consultations c
        JOIN doctor_schedules ds ON ds.id = c.schedule_id
        INNER JOIN prescriptions p ON p.consultation_id = c.id
        WHERE ds.doctor_id = ?
    `,
    getByDoctorPending: `
        SELECT c.*, ds.doctor_id, p.id as prescriptionId
        FROM consultations c
        JOIN doctor_schedules ds ON ds.id = c.schedule_id
        LEFT JOIN prescriptions p ON p.consultation_id = c.id
        WHERE ds.doctor_id = ? AND p.id IS NULL
    `
};