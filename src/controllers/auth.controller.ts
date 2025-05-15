// Mengimpor error InvalidCredentialsError
import { InvalidCredentialsError, NotFoundError } from "@/errors";
// Mengimpor fungsi loginService dari service auth
import { loginService, setPassword } from "@/services/auth.service";
// Mengimpor tipe Request dan Response dari express
import type { Request, Response } from "express";
// Mengimpor modul zod untuk validasi
import { z } from "zod";

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Authenticate user and return JWT token.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Login successful.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/LoginResponse"
 *       400:
 *         description: Validation failed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/BadResponse"
 *       401:
 *         description: Invalid credentials.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/InvalidCredentials"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/InternalErrorResponse"
 */
export async function login(req: Request, res: Response) {   
    // Mendefinisikan schema validasi untuk email dan password
    const validationSchema = z.object({
        email: z.string()
            .min(1, "Please provide email")
            .email("Invalid email format"),
        password: z.string()
            .min(1, "Please provide password")
    });

    // Validasi request body dengan schema di atas
    const result = validationSchema.safeParse(req.body);
    
    if (!result.success) {
        // Mapping error validasi dan mengirim response 400
        const errors = result.error.errors.map(error => ({
            field: error.path[0],
            error: error.message
        }));

        res.status(400).json({
            message: "Validation failed",
            errors
        });
        return;
    }

    try {
        // Memanggil service untuk login dan mendapatkan token JWT
        const token = await loginService(req.body.email, req.body.password);

        // Mengirim response sukses dengan token
        res.status(200).json({
            message: "Login successful",
            data: {
                token
            },
            next: {
            }
        })
        return;
    } catch (error) {
        // Jika error berkaitan dengan kredensial tidak valid, kirim response 401
        if (error instanceof InvalidCredentialsError) {
            res.status(401).json({
                message: error.message
            });
            return;
        }
        // Mencetak error dan mengirim response 500 untuk error lain
        console.error(error);
        res.status(500).json({
            message: "Something went wrong. Please try again later."
        });
    }
}

/**
 * @swagger
 * /set-password:
 *   put:
 *     summary: Reset password using a token.
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Reset token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *             required:
 *               - password
 *     responses:
 *       200:
 *         description: Password set successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *       400:
 *         description: Validation failed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/BadResponse"
 *       404:
 *         description: Not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/NotFoundResponse"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/InternalErrorResponse"
 */
export const setPasswordController = async (req: Request, res: Response) => {
  
  if (!req.body) {
    res.status(400).json({
      message: "JSON body is required"
    });
    return;
  }
  
  const { password } = req.body;
  const { token } = req.query;

  const input = {token, password};
  
  // Validasi schema untuk token dan password
  const validationSchema = z.object({
    token: z.string().min(1, "Token is required."),
    password: z.string()
      .min(1, "Please provide password")
      .min(8, "Password must be at least 8 characters"),
  });

  // Validasi request body dengan schema di atas
  const result = validationSchema.safeParse(input);

  if (!result.success) {
    // Mapping error validasi dan mengirim response 400
    const errors = result.error.errors.map(error => ({
      field: error.path[0],
      error: error.message
    }));

    res.status(400).json({
      message: "Validation failed",
      errors
    });
    return;
  }

  try {
    // Panggil business logic yang berada di setPassword dalam auth.service.ts
    const successMessage: string = await setPassword(result.data.token, result.data.password);

    res.status(200).json({ message: successMessage });
    return;
  } catch (error) {

    if (error instanceof NotFoundError) {
      res.status(404).json({
        message: error.message
      });
      return;
    }

    console.error("Error setPassword:", error);
    res.status(500).json({ message: "Something went wrong." });
    return;
  }
};
