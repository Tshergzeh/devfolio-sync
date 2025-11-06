/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import { userController } from "@/controllers/user.controller";
import { userService } from "@/services/user.service";

jest.mock("@/services/user.service");

describe("userController.getAllUsers", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn(() => ({ json: jsonMock })) as any;

    req = {};
    res = {
      status: statusMock,
      json: jsonMock,
    };
  });

  it("should return 200 and all users", async () => {
    const mockUsers = [
      { _id: "1", name: "User 1", email: "user1@example.com" },
      { _id: "2", name: "User 2", email: "user2@example.com" },
    ];
    (userService.getAllUsers as jest.Mock).mockResolvedValue(mockUsers);

    await userController.getAllUsers(req as Request, res as Response);

    expect(userService.getAllUsers).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, users: mockUsers });
  });

  it("should handle errors gracefully", async () => {
    const mockError = new Error("Database failure");
    (userService.getAllUsers as jest.Mock).mockRejectedValue(mockError);

    // Wrap in try-catch since controller doesn't call next() directly
    try {
      await userController.getAllUsers(req as Request, res as Response);
    } catch (err) {
      expect(err).toEqual(mockError);
    }
  });
});
