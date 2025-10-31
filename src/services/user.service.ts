import jwt from "jsonwebtoken";
import "dotenv/config";

import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "@/errors/httpError";
import { User } from "@/models/user.model";
import { IUser } from "@/types";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = "7d";

export const userService = {
  async createUser(data: { name: string; email: string; password: string }): Promise<IUser> {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) throw new ConflictError("Email already registered");

    const user = new User(data);
    await user.save();
    return user;
  },

  async login(email: string, password: string) {
    const user = await User.findOne({ email });
    if (!user) throw new UnauthorizedError("Invalid credentials");

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new UnauthorizedError("Invalid credentials");

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    };
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) throw new BadRequestError("Incorrect current password");

    user.password = newPassword;
    await user.save();

    return user;
  },

  async deleteUser(requesterId: string, targetUserId: string) {
    const requester = await User.findById(requesterId);
    const targetUser = await User.findById(targetUserId);

    if (!requester) throw new NotFoundError("Requester not found");
    if (!targetUser) throw new NotFoundError("User not found");

    if (requester.role !== "admin" && requesterId !== targetUserId)
      throw new ForbiddenError("Forbidden: insufficient permissions");

    if (targetUser.role === "admin" && requester.role === "admin")
      throw new ForbiddenError("Forbidden: cannot delete an admin account");

    targetUser.isDeleted = true;
    targetUser.deletedAt = new Date();
    await targetUser.save();

    return { message: "User marked as deleted" };
  },
};
