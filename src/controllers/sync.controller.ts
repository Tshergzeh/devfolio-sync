import { Request, Response } from "express";
import { manualSyncService } from "@/services/sync.service";
import { BadRequestError } from "@/errors/httpError";

export const manualSync = async (req: Request, res: Response) => {
  try {
    const username = process.env.GITHUB_USERNAME;

    if (!username) throw new BadRequestError("GitHub username is required");

    const result = await manualSyncService(username);
    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to perform manual sync" });
  }
};
