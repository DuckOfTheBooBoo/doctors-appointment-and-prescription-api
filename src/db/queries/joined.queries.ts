export const joinedQueries = {
    // Query untuk mengambil semua pending registrations dengan join antara users, medical_professionals, dan licenses
    getAllPendingRegistrations: `SELECT
    u.id,
    u.prefix,
    u.suffix,
    u.first_name,
    u.last_name,
    u.date_of_birth,
    u.gender,
    u.phone,
    u.address,
    u.is_active,
    u.created_at,
    m.role,
    m.specialization,
    m.status AS work_status,
    l.id AS license_id,
    l.number,
    l.issuing_authority,
    l.issue_date,
    l.expiry_date,
    l.status AS license_status,
    l.specialty
  FROM users u
  JOIN medical_professionals m
    ON u.id = m.id
  JOIN licenses l
    ON m.license_id = l.id
  WHERE m.status = 'pending';`
}