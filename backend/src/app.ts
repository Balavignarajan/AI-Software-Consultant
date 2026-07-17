import "dotenv/config";
import cors from "cors";
import express from "express";
import { config } from "./config/env.js";
import { pool } from "./db/index.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFound } from "./middleware/not-found.js";

const app = express();
const PORT = config.PORT;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is running successfully 🚀",
    timestamp: new Date().toISOString(),
  });
});

app.use(notFound);
app.use(errorHandler);

async function verifyDatabaseConnection(): Promise<void> {
  try {
    const result = await pool.query<{ current_time: Date }>(
      "SELECT NOW() AS current_time",
    );
    const currentTime = result.rows[0]?.current_time;

    console.log("✅ Connected to Neon PostgreSQL");
    console.log(`Database Time: ${currentTime?.toISOString?.() ?? String(currentTime)}`);
  } catch (error) {
    console.error("❌ Failed to connect to Neon PostgreSQL");
    console.error(error);
  }
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  void verifyDatabaseConnection();
});
