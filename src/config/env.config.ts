import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface Environment {
  PORT: number;
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  JWT_SECRET?: string;
  JWT_EXPIRES_IN?: string;
  ADMIN_KEY: string;
  SALT_ROUNDS: number;
}

// Set default values for environment variables
export const env: Environment = {
  PORT: Number(process.env.PORT) || 3000,
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: Number(process.env.DB_PORT) || 3306,
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || 'password',
  DB_NAME: process.env.DB_NAME || 'my_database',
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  ADMIN_KEY: process.env.ADMIN_KEY || 'admin_key',
  SALT_ROUNDS: process.env.SALT_ROUNDS ? parseInt(process.env.SALT_ROUNDS) : 10
};

// Validate required environment variables
export const validateEnv = (): void => {
  const requiredEnvVars: Array<keyof Environment> = [
    'DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'ADMIN_KEY', 'JWT_SECRET'
  ];
  
  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );
  
  if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  }
};