// Mengimpor Router dari express
import { Router } from "express";
// Mengimpor router user dari file user.routes
import userRoutes from "./user.routes";
// Mengimpor router auth dari file auth.routes
import authRoutes from "./auth.routes";
// Mengimpor router doctor dari file doctor.routes
import doctorRoutes from "./doctor.routes";
// Mengimpor router pharmacist dari file pharmacist.routes
import pharmacistRoutes from "./pharmacist.routes";
// Mengimpor router admin dari file admin.routes
import adminRoutes from "./admin.routes";
// Mengimpor router consultation dari file consultation.routes
import consultationRoutes from "./consultation.routes";
import { jwtMiddleware } from "@/middlewares/jwt.middleware";
import medicineRoutes from "./medicine.routes";
import swaggerUi from "swagger-ui-express";
import swaggerConfig from "@/config/swagger.config";


const router = Router(); // Membuat instance router utama

router.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerConfig)); //  Menggunakan swagger-ui-express untuk menampilkan dokumentasi API

router.use("/users", userRoutes); // Menggunakan route untuk user dengan prefix "/users"
router.use("/auth", authRoutes); // Menggunakan route untuk auth dengan prefix "/auth"
router.use("/doctors", doctorRoutes); // Menggunakan route untuk doctor dengan prefix "/doctors"
router.use("/pharmacists", pharmacistRoutes); // Menggunakan route untuk pharmacist dengan prefix "/pharmacists"
router.use("/admin", adminRoutes); // Menggunakan route untuk admin dengan prefix "/admin"
router.use("/consultations", jwtMiddleware, consultationRoutes); // Menggunakan route untuk consultation dengan prefix "/consultations"
router.use("/medicines", jwtMiddleware, medicineRoutes); // Menggunakan route untuk medicines dengan prefix "/medicines"

export default router; // Mengekspor router utama