import { logger } from "@/utils/logger";

export async function fetchWithLogging(url: string, options?: RequestInit) {
  const start = Date.now();
  logger.info("Starting fetch", { url, method: options?.method || "GET" });

  try {
    const response = await fetch(url, options);
    const duration = Date.now() - start;
    logger.info("Fetch completed", {
      url,
      status: response.status,
      durationMs: duration,
    });
    return response;
  } catch (error) {
    const duration = Date.now() - start;
    logger.error("Fetch failed", { url, durationMs: duration, error: String(error) });
    throw error;
  }
}
