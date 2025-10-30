import express from "express";

import { getAllProjects, getProjectById, recurateProject } from "@/controllers/project.controller";

const router = express.Router();

router.get("/", getAllProjects);
router.get("/:id", getProjectById);
router.post(":/id/recurate", recurateProject);

export default router;
