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

app.get("/", (req: Request, res: Response) => {
    res.status(200).send("Hello World!");
})

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
