import { env } from '@/config/env.config';
import { JWTInvalidError } from '@/errors';
import jwt from 'jsonwebtoken';

export interface JWTPayload {
    userId: number;
    role: string;
}

export function signToken(userId: number, role: string): string {
    const payload: JWTPayload = {userId, role};
    const options = {expiresIn: env.JWT_EXPIRES_IN}
    return jwt.sign(payload, env.JWT_SECRET!, options);
}

export function verifyToken(token: string): JWTPayload {
    try {
        return jwt.verify(token, env.JWT_SECRET!) as JWTPayload;
    } catch (error) {
        throw new JWTInvalidError("Invalid token");
    }
}