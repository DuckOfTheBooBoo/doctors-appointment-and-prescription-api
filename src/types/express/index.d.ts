import { JWTPayload } from "@/utils/jwt";

declare global {
    namespace Express {
        interface Request {
            decodedToken: JWTPayload
        }
    }
}