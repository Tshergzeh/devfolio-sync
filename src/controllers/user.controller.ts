import { Request, Response } from "express";
import { userService } from "@/services/user.service";

export const userController = {
  async getAllUsers(req: Request, res: Response) {
    const users = await userService.getAllUsers();
    res.status(200).json({ success: true, users });
  },
};
