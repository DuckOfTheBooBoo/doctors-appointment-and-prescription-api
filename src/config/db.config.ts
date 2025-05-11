import { env } from "./env.config";
import type { PoolOptions } from "mysql2/promise";

export default {
    // Host database
    host: env.DB_HOST,
    // Port database
    port: env.DB_PORT,
    // User database
    user: env.DB_USER,
    // Password database
    password: env.DB_PASSWORD,
    // Nama database
    database: env.DB_NAME,
    // Menunggu koneksi jika belum tersedia
    waitForConnections: true,
    // Batas maksimal koneksi
    connectionLimit: 10,
    // Batas antrean koneksi
    queueLimit: 0,
    // Mengaktifkan keep alive pada koneksi
    enableKeepAlive: true,
} as PoolOptions;