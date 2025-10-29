import { webhookService } from "@/services/github.service";
import { Request, Response } from "express";

export const webhook = async (req: Request, res: Response) => {
  const eventHeader = req.headers["x-github-event"];
  const event =
    typeof eventHeader === "string"
      ? eventHeader
      : Array.isArray(eventHeader)
        ? eventHeader[0]
        : undefined;
  const ref = typeof req.body.ref === "string" ? req.body.ref : undefined;

  if (!event || !ref) {
    return res.status(400).send("Missing event or ref");
  }

  await webhookService(event, ref);

  res.status(200).send("Webhook received");
};
