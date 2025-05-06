import dbConfig from "@/config/db.config";
import type { Pool, PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import mysql from "mysql2/promise";

class DatabaseConnection {
    private static instance: DatabaseConnection;
    private pool: Pool;

    constructor() {
        this.pool = mysql.createPool(dbConfig);
        this.testConnection();
    }

    public static getInstance(): DatabaseConnection {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }

        return DatabaseConnection.instance;
    }

    private async testConnection(): Promise<void> {
        try {
            const connection = await this.pool.getConnection();
            console.log("Database connection successful");
            connection.release();
        } catch (error) {
            console.error("Failed to connect to the database: ", error);
            throw error;
        }
    }

    public async getConnection(): Promise<PoolConnection> {
        try {
            return await this.pool.getConnection();
        } catch (error) {
            console.error("Error getting database connection:", error);
            throw error;
        }
    }

    public async query<T extends RowDataPacket[]>(sql: string, params?: any[]): Promise<T> {
        try {
            const [rows] = await this.pool.query<T>(sql, params);
            return rows;
        } catch (error) {
            console.error("Error executing query:", error);
            throw error;
        }
    }

    public async execute(sql: string, params?: any[]): Promise<ResultSetHeader> {
        try {
            const [result] = await this.pool.execute<ResultSetHeader>(sql, params);
            return result;
        } catch (error) {
            console.error("Error executing statement:", error);
            throw error;
        }
    }

    public async transaction<T>(callback: (connection: PoolConnection) => Promise<T>): Promise<T> {
        const conn = await this.getConnection();
        try {
            await conn.beginTransaction();
            const result = await callback(conn);
            await conn.commit();
            return result;
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    }

    public async closePool(): Promise<void> {
        try {
            await this.pool.end();
            console.log('Database connection pool closed')
        } catch (error) {
            
        }
    }
}

export const db = DatabaseConnection.getInstance();