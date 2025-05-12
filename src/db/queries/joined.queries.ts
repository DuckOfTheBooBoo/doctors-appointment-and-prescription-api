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
  WHERE m.status = 'pending';`,
  // Query baru untuk mengambil user beserta role dari medical_professionals menggunakan LEFT JOIN
  // Jika user adalah patient, maka kolom role akan bernilai NULL
  getUserByEmail: `SELECT 
    u.*, 
    mp.role 
  FROM users u 
  LEFT JOIN medical_professionals mp 
    ON u.id = mp.id 
  WHERE u.email = ? AND u.is_active = 1`
};