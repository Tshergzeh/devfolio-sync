import { userService } from "@/services/user.service";
import { Request, Response } from "express";

export const authController = {
  async register(req: Request, res: Response) {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const user = await userService.createUser({ name, email, password });
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
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
};
