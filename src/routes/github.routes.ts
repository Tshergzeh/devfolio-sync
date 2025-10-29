import express from "express";
import { verifySignature } from "@/middleware/verifySignature";
import { webhook } from "@/controllers/github.controller";

const router = express.Router();

router.post("/webhook", verifySignature, webhook);

export default router;
