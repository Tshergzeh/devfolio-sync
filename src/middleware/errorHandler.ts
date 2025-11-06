import { Request, Response, NextFunction } from "express";
import { HttpError } from "@/errors/httpError";
import { logger } from "@/utils/logger";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  logger.error(err);

  if ((err as HttpError).httpStatus) {
    return res.status((err as HttpError).httpStatus).json({ message: err.message });
  }

  return res.status(500).json({ message: "Internal server error" });
}
