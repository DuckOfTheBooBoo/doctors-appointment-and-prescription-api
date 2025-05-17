import dotenv from 'dotenv';
import path from 'path';

// Memuat environment variables dari file .env yang berada di dua level di atas direktori ini
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Mendefinisikan interface Environment untuk tipe environment variables
interface Environment {
  PORT: number | undefined;
  DB_SOCKET_PATH: string | undefined;
  DB_HOST: string | undefined;
  DB_PORT: number | undefined;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  JWT_SECRET?: string;
  JWT_EXPIRES_IN?: number; // lama waktu kadaluarsa JWT (detik)
  ADMIN_KEY: string;
  SALT_ROUNDS: number;
}

// Membuat objek env dengan nilai default bila tidak didefinisikan
export const env: Environment = {
  PORT: Number(process.env.PORT) || 3000,
  DB_SOCKET_PATH: process.env.DB_SOCKET_PATH,
  DB_HOST: process.env.DB_SOCKET_PATH ? undefined : (process.env.DB_HOST || 'localhost'),
  DB_PORT: process.env.DB_SOCKET_PATH ? undefined : (Number(process.env.DB_PORT) || 3306),
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || 'password',
  DB_NAME: process.env.DB_NAME || 'my_database',
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ? parseInt(process.env.JWT_EXPIRES_IN) : 3600,
  ADMIN_KEY: process.env.ADMIN_KEY || 'admin_key',
  SALT_ROUNDS: process.env.SALT_ROUNDS ? parseInt(process.env.SALT_ROUNDS) : 10
};

console.log(env);

// Fungsi untuk memvalidasi environment variables yang wajib ada
export const validateEnv = (): void => {
  // Daftar variabel yang diperlukan
  const requiredEnvVars: Array<keyof Environment> = [
    'DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'ADMIN_KEY', 'JWT_SECRET'
  ];
  
  // Memeriksa variabel yang tidak didefinisikan
  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );
  
  // Jika ada variabel yang hilang, lempar error
  if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  }
};