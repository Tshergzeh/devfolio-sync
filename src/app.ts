import express from "express";
import "dotenv/config";

import { connectDB } from "@/config/db";
import { errorHandler } from "@/middleware/errorHandler";
import { fetchPortfolioRepos } from "@/services/githubFetcher";
import projectRoutes from "@/routes/project.routes";

const app = express();
const PORT = process.env.PORT || 3000;
const USERNAME = process.env.GITHUB_USERNAME || "Tshergzeh";

app.use(express.json());
app.use("/api/projects", projectRoutes);
app.use(errorHandler);

(async () => {
  await connectDB();
  await fetchPortfolioRepos(USERNAME);
})();

app.get("/", (req, res) => {
  res.send("Devfolio Sync API is live");
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
