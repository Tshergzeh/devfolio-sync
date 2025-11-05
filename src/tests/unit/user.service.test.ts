/* eslint-disable @typescript-eslint/no-explicit-any */
process.env.JWT_SECRET = "testsecret";

import jwt from "jsonwebtoken";
import { userService } from "@/services/user.service";
import { User } from "@/models/user.model";
import {
  ConflictError,
  UnauthorizedError,
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from "@/errors/httpError";

jest.mock("jsonwebtoken");
jest.mock("@/models/user.model");

describe("userService", () => {
  const mockUser: any = {
    _id: "123",
    name: "John Doe",
    email: "john@example.com",
    password: "hashed",
    role: "editor",
    isDeleted: false,
    isFirstLogin: true,
    comparePassword: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "testsecret";
  });

  // ────────────────────────────────
  // getAllUsers
  // ────────────────────────────────
  it("should return non-deleted users without password", async () => {
    const selectMock = jest.fn().mockResolvedValue([mockUser]);
    (User.find as any).mockReturnValue({ select: selectMock });

    const result = await userService.getAllUsers();

    expect(User.find).toHaveBeenCalledWith({ isDeleted: false });
    expect(selectMock).toHaveBeenCalledWith("-password");
    expect(result).toEqual([mockUser]);
  });

  // ────────────────────────────────
  // createUser
  // ────────────────────────────────
  it("should throw ConflictError if email already exists", async () => {
    (User.findOne as any).mockResolvedValue(mockUser);

    await expect(
      userService.createUser({
        name: "John",
        email: "john@example.com",
        password: "password",
        role: "editor",
      })
    ).rejects.toThrow(ConflictError);
  });

  it("should create and save a new user", async () => {
    (User.findOne as any).mockResolvedValue(null);
    const saveMock = jest.fn();
    (User as any).mockImplementation(() => ({ save: saveMock }));

    await userService.createUser({
      name: "Jane",
      email: "jane@example.com",
      password: "password",
      role: "editor",
    });

    expect(saveMock).toHaveBeenCalled();
  });

  // ────────────────────────────────
  // login
  // ────────────────────────────────
  it("should throw UnauthorizedError if user not found", async () => {
    (User.findOne as any).mockResolvedValue(null);
    await expect(userService.login("x@y.com", "pass")).rejects.toThrow(UnauthorizedError);
  });

  it("should throw UnauthorizedError if password invalid", async () => {
    mockUser.comparePassword.mockResolvedValue(false);
    (User.findOne as any).mockResolvedValue(mockUser);

    await expect(userService.login("x@y.com", "pass")).rejects.toThrow(UnauthorizedError);
  });

  it("should return token and user info on successful login", async () => {
    mockUser.comparePassword.mockResolvedValue(true);
    (User.findOne as any).mockResolvedValue(mockUser);
    (jwt.sign as jest.Mock).mockReturnValue("mocktoken");

    const result = await userService.login("x@y.com", "pass");

    expect(jwt.sign).toHaveBeenCalledWith(
      { userId: mockUser._id, email: mockUser.email, role: mockUser.role },
      "testsecret",
      { expiresIn: "7d" }
    );

    expect(result).toEqual({
      token: "mocktoken",
      user: expect.objectContaining({
        id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
        isFirstLogin: mockUser.isFirstLogin,
      }),
    });
  });

  // ────────────────────────────────
  // changePassword
  // ────────────────────────────────
  it("should throw NotFoundError if user not found", async () => {
    (User.findById as any).mockResolvedValue(null);
    await expect(userService.changePassword("1", "old", "new")).rejects.toThrow(NotFoundError);
  });

  it("should throw BadRequestError if current password incorrect", async () => {
    mockUser.comparePassword.mockResolvedValue(false);
    (User.findById as any).mockResolvedValue(mockUser);

    await expect(userService.changePassword("1", "old", "new")).rejects.toThrow(BadRequestError);
  });

  it("should update password and save", async () => {
    mockUser.comparePassword.mockResolvedValue(true);
    (User.findById as any).mockResolvedValue(mockUser);

    await userService.changePassword("1", "old", "new");

    expect(mockUser.password).toBe("new");
    expect(mockUser.save).toHaveBeenCalled();
  });

  // ────────────────────────────────
  // updateFirstLoginPassword
  // ────────────────────────────────
  it("should throw NotFoundError if user not found", async () => {
    (User.findById as any).mockResolvedValue(null);
    await expect(userService.updateFirstLoginPassword("1", "new")).rejects.toThrow(NotFoundError);
  });

  it("should throw BadRequestError if user deleted", async () => {
    (User.findById as any).mockResolvedValue({ ...mockUser, isDeleted: true });
    await expect(userService.updateFirstLoginPassword("1", "new")).rejects.toThrow(BadRequestError);
  });

  it("should throw BadRequestError if not first login", async () => {
    (User.findById as any).mockResolvedValue({ ...mockUser, isFirstLogin: false });
    await expect(userService.updateFirstLoginPassword("1", "new")).rejects.toThrow(BadRequestError);
  });

  it("should update password and mark first login as false", async () => {
    const saveMock = jest.fn();
    (User.findById as any).mockResolvedValue({ ...mockUser, save: saveMock });

    const result = await userService.updateFirstLoginPassword("1", "new");

    expect(result).toEqual({ message: "Password updated successfully" });
    expect(saveMock).toHaveBeenCalled();
  });

  // ────────────────────────────────
  // deleteUser
  // ────────────────────────────────
  it("should throw NotFoundError if requester not found", async () => {
    (User.findById as any).mockResolvedValueOnce(null).mockResolvedValueOnce(mockUser);

    await expect(userService.deleteUser("req", "target")).rejects.toThrow(NotFoundError);
  });

  it("should throw NotFoundError if target not found", async () => {
    (User.findById as any).mockResolvedValueOnce(mockUser).mockResolvedValueOnce(null);

    await expect(userService.deleteUser("req", "target")).rejects.toThrow(NotFoundError);
  });

  it("should throw ForbiddenError if requester not admin and not self", async () => {
    (User.findById as any)
      .mockResolvedValueOnce({ ...mockUser, role: "editor", _id: "1" })
      .mockResolvedValueOnce({ ...mockUser, _id: "2" });

    await expect(userService.deleteUser("1", "2")).rejects.toThrow(ForbiddenError);
  });

  it("should throw ForbiddenError if both are admins", async () => {
    (User.findById as any)
      .mockResolvedValueOnce({ ...mockUser, role: "admin" })
      .mockResolvedValueOnce({ ...mockUser, role: "admin" });

    await expect(userService.deleteUser("1", "2")).rejects.toThrow(ForbiddenError);
  });

  it("should mark target user as deleted and save", async () => {
    const saveMock = jest.fn();
    const targetUser = { ...mockUser, save: saveMock, role: "editor" };
    const requester = { ...mockUser, role: "admin" };

    (User.findById as any).mockResolvedValueOnce(requester).mockResolvedValueOnce(targetUser);

    const result = await userService.deleteUser("admin", "target");

    expect(targetUser.isDeleted).toBe(true);
    expect(saveMock).toHaveBeenCalled();
    expect(result).toEqual({ message: "User marked as deleted" });
  });
});
