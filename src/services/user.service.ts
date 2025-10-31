import jwt from "jsonwebtoken";
import "dotenv/config";

import { ConflictError, UnauthorizedError } from "@/errors/httpError";
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
};
