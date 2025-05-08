export const licenseQueries = {
    create: `INSERT INTO licenses (number, issuing_authority, issue_date, expiry_date, specialty) VALUES (?,?,?,?,?);`
}