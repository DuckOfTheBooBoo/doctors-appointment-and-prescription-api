import { login } from "@/controllers/auth.controller";
import { Router } from "express";

const authRouter = Router();

authRouter.post("/login", login);

export default authRouter;