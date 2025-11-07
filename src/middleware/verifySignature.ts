/* eslint-disable @typescript-eslint/no-namespace */
import { RequestHandler } from "express";
import "dotenv/config";
import crypto from "crypto";

const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET!;

// Augment the Express Request type safely
declare global {
  namespace Express {
    interface Request {
      rawBody?: Buffer | string;
    }
  }
}

export const verifySignature: RequestHandler = (req, res, next) => {
  const signature = req.headers["x-hub-signature-256"] as string | undefined;
  const rawBody = req.rawBody;

  if (!signature || !rawBody) {
    return res.status(400).send("Missing signature or raw body");
  }

  const expected =
    "sha256=" + crypto.createHmac("sha256", GITHUB_WEBHOOK_SECRET).update(rawBody).digest("hex");

  if (signature !== expected) {
    return res.status(401).send("Invalid signature");
  }

  next();
};
