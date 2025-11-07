import express from "express";
import { verifySignature } from "@/middleware/verifySignature.js";
import { webhook } from "@/controllers/github.controller.js";

const router = express.Router();

router.post("/webhook", verifySignature, webhook);

export default router;
