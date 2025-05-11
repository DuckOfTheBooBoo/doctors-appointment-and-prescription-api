export const licenseQueries = {
    // Query untuk membuat record license baru
    create: `INSERT INTO licenses (number, issuing_authority, issue_date, expiry_date, specialty) VALUES (?,?,?,?,?);`
}