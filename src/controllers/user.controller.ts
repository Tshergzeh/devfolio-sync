import { Request, Response } from "express";
import { userService } from "@/services/user.service.js";
import { logger } from "@/utils/logger.js";

export const userController = {
  async getAllUsers(req: Request, res: Response) {
    const start = Date.now();
    logger.info("Starting fetch", { url: req.originalUrl, method: req.method });

    const users = await userService.getAllUsers();

    const duration = Date.now() - start;
    logger.info("Fetch completed", {
      url: req.originalUrl,
      status: "success",
      durationMs: duration,
    });

    res.status(200).json({ success: true, users });
  },
};
