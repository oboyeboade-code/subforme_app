import type { Response } from "express";

/**
 * Uniform success envelope so the frontend `apiRequest` client can
 * always destructure `{ status, message, data }`.
 */
export function ok<T>(
  res: Response,
  data: T,
  message = "OK",
  statusCode = 200
) {
  return res.status(statusCode).json({
    status: "success",
    message,
    data,
  });
}
