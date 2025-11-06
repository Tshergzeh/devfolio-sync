import { webhookService } from "@/services/github.service";
import { logger } from "@/utils/logger";
import { Request, Response } from "express";

export const webhook = async (req: Request, res: Response) => {
  const start = Date.now();
  logger.info("Starting fetch", { url: req.originalUrl, method: req.method });

  const eventHeader = req.headers["x-github-event"];
  const event =
    typeof eventHeader === "string"
      ? eventHeader
      : Array.isArray(eventHeader)
        ? eventHeader[0]
        : undefined;
  const ref = typeof req.body.ref === "string" ? req.body.ref : undefined;

  if (!event || !ref) {
    return res.status(400).send("Missing event or ref");
  }

  await webhookService(event, ref);

  const duration = Date.now() - start;
  logger.info("Fetch completed", {
    url: req.originalUrl,
    status: "success",
    durationMs: duration,
  });

  res.status(200).send("OK");
};
