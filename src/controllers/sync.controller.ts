import { Request, Response } from "express";
import { manualSyncService } from "@/services/sync.service";
import { BadRequestError } from "@/errors/httpError";
import { logger } from "@/utils/logger";

export const manualSync = async (req: Request, res: Response) => {
  const start = Date.now();
  logger.info("Starting fetch", { url: req.originalUrl, method: req.method });

  try {
    const username = process.env.GITHUB_USERNAME;

    if (!username) throw new BadRequestError("GitHub username is required");

    const result = await manualSyncService(username);

    const duration = Date.now() - start;
    logger.info("Fetch completed", {
      url: req.originalUrl,
      status: "success",
      durationMs: duration,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to perform manual sync" });
  }
};
