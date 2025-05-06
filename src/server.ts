import express from "express";
import router from "./routes";
import { validateEnv } from "./config/env.config";

try {
  validateEnv();
} catch (err) {
  const error = err as Error;
  console.error("Environment validation failed:", error.message);
  process.exit(1);
}

const app = express();

app.use(express.json());

app.use("/", router);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
