// Mengimpor modul express untuk membuat server
import express from "express";
// Mengimpor router untuk menangani rute HTTP
import router from "./routes";
// Mengimpor fungsi validateEnv untuk validasi variabel lingkungan
import { env, validateEnv } from "./config/env.config";

// Memvalidasi environment di awal aplikasi
try {
  // Memanggil fungsi validasi environment
  validateEnv();
} catch (err) {
  // Menangkap error dan meng-cast ke tipe Error
  const error = err as Error;
  // Mencetak error validasi ke console
  console.error("Environment validation failed:", error.message);
  // Keluar dari proses jika validasi gagal
  process.exit(1);
}

// Menginisialisasi aplikasi express
const app = express();

// Menggunakan middleware express.json() untuk parsing JSON dari request
app.use(express.json());

// Menggunakan router untuk semua rute dengan prefix "/"
app.use("/", router);

// Menjalankan server di port 3000
app.listen(env.PORT, () => {
  // Mencetak pesan ke console ketika server berhasil dijalankan
  console.log(`Server is running on port ${env.PORT}`);
});
