import { ConflictError } from "@/errors/httpError";
import { User } from "@/models/user.model";
import { IUser } from "@/types";

export const userService = {
  async createUser(data: { name: string; email: string; password: string }): Promise<IUser> {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) throw new ConflictError("Email already registered");

    const user = new User(data);
    await user.save();
    return user;
  },
};
