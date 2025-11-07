import { BadRequestError, UnauthorizedError } from "@/errors/httpError.js";
import { userService } from "@/services/user.service.js";
import { AuthRequest } from "@/types";
import { logger } from "@/utils/logger.js";
import { Request, Response } from "express";

export const authController = {
  async register(req: Request, res: Response) {
    const start = Date.now();
    logger.info("Starting fetch", { url: req.originalUrl, method: req.method });

    const { name, email, password, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const user = await userService.createUser({ name, email, password, role });
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const duration = Date.now() - start;
    logger.info("Fetch completed", {
      url: req.originalUrl,
      status: "success",
      durationMs: duration,
    });

    return res.status(201).json(userResponse);
  },

  async login(req: Request, res: Response) {
    const start = Date.now();
    logger.info("Starting fetch", { url: req.originalUrl, method: req.method });

    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const { token, user } = await userService.login(email, password);

    const duration = Date.now() - start;
    logger.info("Fetch completed", {
      url: req.originalUrl,
      status: "success",
      durationMs: duration,
    });

    return res.status(200).json({ token, user });
  },

  async changePassword(req: AuthRequest, res: Response) {
    const start = Date.now();
    logger.info("Starting fetch", { url: req.originalUrl, method: req.method });

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      throw new BadRequestError("Both current and new passwords are required");

    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedError("Unauthorized");

    await userService.changePassword(userId, currentPassword, newPassword);

    const duration = Date.now() - start;
    logger.info("Fetch completed", {
      url: req.originalUrl,
      status: "success",
      durationMs: duration,
    });

    return res.status(200).json({ message: "Password changed successfully" });
  },

  async updateFirstLoginPassword(req: AuthRequest, res: Response) {
    const start = Date.now();
    logger.info("Starting fetch", { url: req.originalUrl, method: req.method });

    const { newPassword } = req.body;
    if (!newPassword) throw new BadRequestError("New password required");

    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedError("Unauthorized");

    const result = await userService.updateFirstLoginPassword(userId, newPassword);

    const duration = Date.now() - start;
    logger.info("Fetch completed", {
      url: req.originalUrl,
      status: "success",
      durationMs: duration,
    });

    res.status(200).json({ success: true, ...result });
  },

  async deleteUser(req: AuthRequest, res: Response) {
    const start = Date.now();
    logger.info("Starting fetch", { url: req.originalUrl, method: req.method });

    const targetUserId = req.params.id;
    const requesterId = req.user?.userId;

    if (!requesterId) throw new UnauthorizedError("Unauthorized");

    const result = await userService.deleteUser(requesterId, targetUserId);

    const duration = Date.now() - start;
    logger.info("Fetch completed", {
      url: req.originalUrl,
      status: "success",
      durationMs: duration,
    });

    return res.status(200).json(result);
  },
};
