import express from "express";
import cors from "cors";
import "dotenv/config";

import { connectDB } from "@/config/db";
import { errorHandler } from "@/middleware/errorHandler";
import { scheduleWeeklySync } from "./jobs/weeklySyncJob";
import authRoutes from "@/routes/auth.routes";
import projectRoutes from "@/routes/project.routes";
import githubRoutes from "@/routes/github.routes";
import syncRoutes from "@/routes/sync.routes";

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "").split(",");

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(
  express.json({
    verify: (req, res, buf) => {
      (req as express.Request & { rawBody?: Buffer }).rawBody = buf;
    },
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/github", githubRoutes);
app.use("/api", syncRoutes);
app.use(errorHandler);

(async () => {
  await connectDB();
  await scheduleWeeklySync();
})();

app.get("/", (req, res) => {
  res.send("Devfolio Sync API is live");
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
