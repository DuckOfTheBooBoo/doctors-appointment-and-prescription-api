// Mengimpor fungsi login dari controller auth
import { login } from "@/controllers/auth.controller";
// Mengimpor Router dari express
import { Router } from "express";

const authRouter = Router(); // Membuat instance router untuk auth

authRouter.post("/login", login); // Mendefinisikan route POST untuk login

export default authRouter; // Mengekspor router auth