import { BadRequestError, UnauthorizedError } from "@/errors/httpError";
import { userService } from "@/services/user.service";
import { AuthRequest } from "@/types";
import { Request, Response } from "express";

export const authController = {
  async register(req: Request, res: Response) {
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

    return res.status(201).json(userResponse);
  },

  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const { token, user } = await userService.login(email, password);
    return res.status(200).json({ token, user });
  },

  async changePassword(req: AuthRequest, res: Response) {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      throw new BadRequestError("Both current and new passwords are required");

    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedError("Unauthorized");

    await userService.changePassword(userId, currentPassword, newPassword);

    return res.status(200).json({ message: "Password changed successfully" });
  },

  async deleteUser(req: AuthRequest, res: Response) {
    const targetUserId = req.params.id;
    const requesterId = req.user?.userId;

    if (!requesterId) throw new UnauthorizedError("Unauthorized");

    const result = await userService.deleteUser(requesterId, targetUserId);
    return res.status(200).json(result);
  },
};
