import { env } from "@/config/env.config";
import bcrypt from "bcrypt";

export async function hashPassword(password: string): Promise<string> {
    try {
        const hash: string = await bcrypt.hash(password, env.SALT_ROUNDS);
        return hash;
    } catch(error) {
        console.error("Failed during creating hash:", error);
        throw error;
    }
}

export async function checkPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    try {
        return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
        console.error("Failed during comparing password:", error);
        throw error;
    }
}