import { createNewUser } from "@/controllers/user.controller";
import { Router } from "express";

const userRouter = Router();

userRouter.post("/", createNewUser);

export default userRouter;