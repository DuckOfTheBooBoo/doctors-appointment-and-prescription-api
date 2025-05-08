import { Router } from "express";
import userRoutes from "./user.routes";
import authRoutes from "./auth.routes";
import doctorRoutes from "./doctor.routes";
import pharmacistRoutes from "./pharmacist.routes";

const router = Router();

router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/doctors", doctorRoutes);
router.use("/pharmacists", pharmacistRoutes);

export default router;