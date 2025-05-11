// Mengimpor fungsi createNewUser dari controller user
import { createNewUser } from "@/controllers/user.controller";
// Mengimpor Router dari express
import { Router } from "express";

const userRouter = Router(); // Membuat instance router untuk user

userRouter.post("/", createNewUser); // Mendefinisikan route POST untuk membuat user baru

export default userRouter; // Mengekspor router user