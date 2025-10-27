import express from "express";
import { manualSync } from "@/controllers/sync.controller";

const router = express.Router();

router.post("/manual-sync", manualSync);

export default router;
