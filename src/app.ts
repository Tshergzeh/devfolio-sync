import express from "express";
import "dotenv/config";
import { connectDB } from "@/config/db";
import { fetchPortfolioRepos } from "@/services/githubFetcher";

const app = express();
const PORT = process.env.PORT || 3000;
const USERNAME = process.env.GITHUB_USERNAME || "Tshergzeh";

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
