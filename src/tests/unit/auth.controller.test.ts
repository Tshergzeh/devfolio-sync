/* eslint-disable @typescript-eslint/no-explicit-any */
import { authController } from "@/controllers/auth.controller";
import { userService } from "@/services/user.service";
import { BadRequestError, UnauthorizedError } from "@/errors/httpError";
import { Request, Response } from "express";

jest.mock("@/services/user.service");

describe("authController", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should return 400 if required fields are missing", async () => {
      await authController.register(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "All fields are required" });
    });

    it("should create user and return 201", async () => {
      (userService.createUser as jest.Mock).mockResolvedValue({
        _id: "1",
        name: "John",
        email: "john@example.com",
        role: "user",
      });

      req.body = { name: "John", email: "john@example.com", password: "1234", role: "user" };
      await authController.register(req as Request, res as Response);

      expect(userService.createUser).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        id: "1",
        name: "John",
        email: "john@example.com",
        role: "user",
      });
    });
  });

  describe("login", () => {
    it("should return 400 if email or password missing", async () => {
      await authController.login(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Email and password are required" });
    });

    it("should return 200 and token when login succeeds", async () => {
      (userService.login as jest.Mock).mockResolvedValue({
        token: "jwt-token",
        user: { id: "1", name: "John", email: "john@example.com", role: "user" },
      });
      req.body = { email: "john@example.com", password: "1234" };

      await authController.login(req as Request, res as Response);

      expect(userService.login).toHaveBeenCalledWith("john@example.com", "1234");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        token: "jwt-token",
        user: { id: "1", name: "John", email: "john@example.com", role: "user" },
      });
    });
  });

  describe("changePassword", () => {
    it("should throw BadRequestError if fields missing", async () => {
      req.body = {};
      await expect(authController.changePassword(req as any, res as Response)).rejects.toThrow(
        BadRequestError
      );
    });

    it("should throw UnauthorizedError if no user in request", async () => {
      req.body = { currentPassword: "old", newPassword: "new" };
      await expect(authController.changePassword(req as any, res as Response)).rejects.toThrow(
        UnauthorizedError
      );
    });

    it("should call userService.changePassword and return 200", async () => {
      req.body = { currentPassword: "old", newPassword: "new" };
      (req as any).user = { userId: "123", email: "x@y.com", role: "user" };
      (userService.changePassword as jest.Mock).mockResolvedValue({});

      await authController.changePassword(req as any, res as Response);

      expect(userService.changePassword).toHaveBeenCalledWith("123", "old", "new");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Password changed successfully" });
    });
  });

  describe("updateFirstLoginPassword", () => {
    it("should throw BadRequestError if no newPassword", async () => {
      req.body = {};
      await expect(
        authController.updateFirstLoginPassword(req as any, res as Response)
      ).rejects.toThrow(BadRequestError);
    });

    it("should throw UnauthorizedError if no user", async () => {
      req.body = { newPassword: "newPass" };
      await expect(
        authController.updateFirstLoginPassword(req as any, res as Response)
      ).rejects.toThrow(UnauthorizedError);
    });

    it("should call service and return 200", async () => {
      req.body = { newPassword: "newPass" };
      (req as any).user = { userId: "123", email: "x@y.com", role: "user" };
      (userService.updateFirstLoginPassword as jest.Mock).mockResolvedValue({
        message: "Password updated successfully",
      });

      await authController.updateFirstLoginPassword(req as any, res as Response);

      expect(userService.updateFirstLoginPassword).toHaveBeenCalledWith("123", "newPass");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Password updated successfully",
      });
    });
  });

  describe("deleteUser", () => {
    it("should throw UnauthorizedError if no requesterId", async () => {
      req.params = { id: "123" };
      await expect(authController.deleteUser(req as any, res as Response)).rejects.toThrow(
        UnauthorizedError
      );
    });

    it("should call userService.deleteUser and return 200", async () => {
      req.params = { id: "target123" };
      (req as any).user = { userId: "admin123", email: "a@a.com", role: "admin" };
      (userService.deleteUser as jest.Mock).mockResolvedValue({
        message: "User marked as deleted",
      });

      await authController.deleteUser(req as any, res as Response);

      expect(userService.deleteUser).toHaveBeenCalledWith("admin123", "target123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "User marked as deleted" });
    });
  });
});
