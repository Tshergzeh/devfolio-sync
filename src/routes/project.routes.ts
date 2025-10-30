import express from "express";

import {
  getAllProjects,
  getProjectById,
  publishUpdatedProject,
  recurateProject,
} from "@/controllers/project.controller";

const router = express.Router();

router.get("/", getAllProjects);
router.get("/:id", getProjectById);
router.post("/:id/recurate", recurateProject);
router.post("/:id/publish", publishUpdatedProject);

export default router;
