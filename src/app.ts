import express from "express";
import "dotenv/config";

import { connectDB } from "@/config/db";
import { errorHandler } from "@/middleware/errorHandler";
import { scheduleWeeklySync } from "./jobs/weeklySyncJob";
import projectRoutes from "@/routes/project.routes";
import githubRoutes from "@/routes/github.routes";
import syncRoutes from "@/routes/sync.routes";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  express.json({
    verify: (req, res, buf) => {
      (req as any).rawBody = buf;
    },
  })
);

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
