import "dotenv/config";
import cors from "cors";
import express from "express";
import { config } from "./config/env.js";
import { pool } from "./db/index.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFound } from "./middleware/not-found.js";
import { authRouter } from "./modules/auth/auth.route.js";
import { chatRouter } from "./modules/chat/chat.route.js";
import { consultationsRouter } from "./modules/consultations/consultations.route.js";
import {
  consultationMessagesRouter,
  messagesRouter,
} from "./modules/conversations/conversations.route.js";
import { usersRouter } from "./modules/users/users.route.js";
import { API_PREFIX } from "./shared/constants/app.js";

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

app.use(`${API_PREFIX}/auth`, authRouter);
app.use(`${API_PREFIX}/users`, usersRouter);
app.use(`${API_PREFIX}/consultations`, consultationsRouter);
app.use(
  `${API_PREFIX}/consultations/:consultationId/messages`,
  consultationMessagesRouter,
);
app.use(
  `${API_PREFIX}/consultations/:consultationId/chat`,
  chatRouter,
);
app.use(`${API_PREFIX}/messages`, messagesRouter);

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
