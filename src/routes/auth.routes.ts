import { login, setPasswordController } from "@/controllers/auth.controller";
import { Router } from "express";

const authRouter = Router();
authRouter.post("/login", login);
authRouter.put("/set-password", setPasswordController);

export default authRouter;