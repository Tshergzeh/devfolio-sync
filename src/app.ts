import express from "express";
import cors from "cors";
import "dotenv/config";

import { connectDB } from "@/config/db.js";
import { errorHandler } from "@/middleware/errorHandler.js";
import { scheduleWeeklySync } from "./jobs/weeklySyncJob.js";
import authRoutes from "@/routes/auth.routes.js";
import userRoutes from "@/routes/user.routes.js";
import projectRoutes from "@/routes/project.routes.js";
import githubRoutes from "@/routes/github.routes.js";
import syncRoutes from "@/routes/sync.routes.js";

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
app.use("/api/users", userRoutes);
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
