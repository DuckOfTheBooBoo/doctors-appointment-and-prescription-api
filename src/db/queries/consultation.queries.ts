export const consultationQueries = {
    create: `INSERT INTO consultations (user_id, schedule_id, booked_at) VALUES (?,?,?);`
};