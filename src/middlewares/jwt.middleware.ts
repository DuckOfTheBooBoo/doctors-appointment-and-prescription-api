// Mengimpor fungsi verifyToken untuk memverifikasi JWT
import { verifyToken } from "@/utils/jwt";
// Mengimpor tipe NextFunction, Request, dan Response dari express
import { NextFunction, Request, Response } from "express"

export function jwtMiddleware(req: Request, res: Response, next: NextFunction) {
    // Mendapatkan header authorization dari request
    const authorization: string | undefined  = req.headers.authorization;
    // Jika tidak ada header authorization, kirim response error
    if (authorization === undefined) {
        res.status(401).json({
            message: "Please provide your authorization header"
        })
        return;
    }

    // Memisahkan token dari string "Bearer (token)"
    // Arajdian Altaf = ['Arajdian', 'Altaf']
    // Bearer awokdaspkdaskd = ['Bearer', 'awokdaspkdaskd']
    const tokenSplit: string[] = authorization.split(" ")
    // Jika token tidak ada, kirim response error
    if (tokenSplit.length <= 1) {
        res.status(401).json({
            message: "Please provide your token"
        })
        return;
    }

    // Jika token tidak valid, kirim response error
    try {
        const payload = verifyToken(tokenSplit[1], { algorithms: ["HS256"]});
        console.log(payload);
        
        // Melanjutkan ke middleware/controller berikutnya
        next();
    } catch (error) {
        res.status(401).json({
            message: "Invalid token"
        })
        return;
    }

}