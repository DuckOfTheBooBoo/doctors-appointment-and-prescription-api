import dbConfig from "@/config/db.config";
import type { Pool, PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import mysql from "mysql2/promise";

class DatabaseConnection {
    // Menyimpan instance singleton dari DatabaseConnection
    private static instance: DatabaseConnection;
    // Menyimpan pool koneksi
    private pool: Pool;

    constructor() {
        // Membuat pool koneksi menggunakan konfigurasi database
        this.pool = mysql.createPool(dbConfig);
        // Menguji koneksi database
        this.testConnection();
    }

    // Mengembalikan instance singleton dari DatabaseConnection
    public static getInstance(): DatabaseConnection {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }

    // Fungsi untuk menguji koneksi database
    private async testConnection(): Promise<void> {
        try {
            // Mendapatkan satu koneksi dari pool
            const connection = await this.pool.getConnection();
            console.log("Database connection successful");
            // Melepaskan koneksi kembali ke pool
            connection.release();
        } catch (error) {
            console.error("Failed to connect to the database: ", error);
            throw error;
        }
    }

    // Fungsi untuk mendapatkan koneksi dari pool
    public async getConnection(): Promise<PoolConnection> {
        try {
            return await this.pool.getConnection();
        } catch (error) {
            console.error("Error getting database connection:", error);
            throw error;
        }
    }

    // Fungsi untuk menjalankan query dan mengembalikan baris hasil
    public async query<T extends RowDataPacket[]>(sql: string, params?: any[]): Promise<T> {
        try {
            const [rows] = await this.pool.query<T>(sql, params);
            return rows;
        } catch (error) {
            console.error("Error executing query:", error);
            throw error;
        }
    }

    // Fungsi untuk menjalankan statement execute dan mengembalikan result header
    public async execute(sql: string, params?: any[]): Promise<ResultSetHeader> {
        try {
            const [result] = await this.pool.execute<ResultSetHeader>(sql, params);
            return result;
        } catch (error) {
            console.error("Error executing statement:", error);
            throw error;
        }
    }

    // Fungsi untuk menjalankan transaksi dengan callback yang diberikan
    public async transaction<T>(callback: (connection: PoolConnection) => Promise<T>): Promise<T> {
        const conn = await this.getConnection();
        try {
            // Memulai transaksi
            await conn.beginTransaction();
            const result = await callback(conn);
            // Commit transaksi jika berhasil
            await conn.commit();
            return result;
        } catch (error) {
            // Rollback transaksi jika terjadi error
            await conn.rollback();
            throw error;
        } finally {
            // Selalu melepaskan koneksi
            conn.release();
        }
    }

    // Fungsi untuk menutup pool koneksi
    public async closePool(): Promise<void> {
        try {
            await this.pool.end();
            console.log('Database connection pool closed')
        } catch (error) {
            // Tangani error jika gagal menutup pool
        }
    }
}

export const db = DatabaseConnection.getInstance();