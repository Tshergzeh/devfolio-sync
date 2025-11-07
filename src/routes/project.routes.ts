import express from "express";

import {
  getAllProjects,
  getProjectById,
  publishUpdatedProject,
  recurateProject,
  updateProjectSummary,
} from "@/controllers/project.controller.js";

const router = express.Router();

router.get("/", getAllProjects);
router.get("/:id", getProjectById);
router.post("/:id/recurate", recurateProject);
router.post("/:id/publish", publishUpdatedProject);
router.put("/:id", updateProjectSummary);

export default router;
