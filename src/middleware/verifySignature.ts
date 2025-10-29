import { Request, Response, NextFunction, raw } from "express";
import "dotenv/config";
import crypto from "crypto";

const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET!;

export function verifySignature(req: Request, res: Response, next: NextFunction) {
  const signature = req.headers["x-hub-signature-256"] as string;
  const rawBody = (req as any).rawBody;

  if (!signature || !rawBody) return res.status(400).send("Missing signature or raw body");

  const expected =
    "sha256=" + crypto.createHmac("sha256", GITHUB_WEBHOOK_SECRET).update(rawBody).digest("hex");

  if (signature !== expected) return res.status(401).send("Invalid signature");

  next();
}
