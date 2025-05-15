// Mengimpor fungsi createNewUser dari controller user
import { createNewUser, deactivateUser } from "@/controllers/user.controller";
import { jwtMiddleware } from "@/middlewares/jwt.middleware";
// Mengimpor Router dari express
import { Router } from "express";

const userRouter = Router(); // Membuat instance router untuk user

userRouter.post("/", createNewUser); // Mendefinisikan route POST untuk membuat user baru
userRouter.delete("/:user_id", jwtMiddleware, deactivateUser); // Mendefinisikan route DELETE untuk menonaktifkan user berdasarkan ID

export default userRouter; // Mengekspor router user