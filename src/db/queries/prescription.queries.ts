export const prescriptionQueries = {
    // Insert a new prescription (issued_at is NOW())
    createPrescription: `INSERT INTO prescriptions (issued_at, consultation_id) VALUES (NOW(), ?);`,
    // Insert a prescription item
    createPrescriptionItem: `INSERT INTO prescription_items (prescription_id, medicine_id, dosage, frequency, duration, notes) VALUES (?,?,?,?,?,?);`,
    // Update consultation's note
    updateConsultationNote: `UPDATE consultations SET note = ? WHERE id = ?;`,
    getPrescriptionItemsByConsultationId: `SELECT pi.*
    FROM prescription_items pi
    JOIN prescriptions p ON pi.prescription_id = p.id
    WHERE p.consultation_id = ?;`
};
