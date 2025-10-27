import express from "express";

import { getAllProjects } from "@/controllers/project.controller";

const router = express.Router();

router.get("/", getAllProjects);

export default router;
