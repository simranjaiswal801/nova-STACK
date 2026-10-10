import mongoose from "mongoose";
import { HttpError } from "../utils/httpError.js";

export function notFound(_req, _res, next) {
  next(
    new HttpError(404, "NOT_FOUND", "The requested API route was not found."),
  );
}

export function errorHandler(error, _req, res, _next) {
  if (res.headersSent) return;
  if (error?.type === "entity.parse.failed")
    return res
      .status(400)
      .json({
        success: false,
        error: {
          code: "INVALID_JSON",
          message: "Request body must contain valid JSON.",
        },
      });
  if (error?.code === 11000)
    return res
      .status(409)
      .json({
        success: false,
        error: {
          code: "DUPLICATE_RECORD",
          message: "A record with this value already exists.",
        },
      });
  if (error instanceof mongoose.Error.ValidationError) {
    const fieldErrors = Object.fromEntries(
      Object.entries(error.errors).map(([key, item]) => [key, item.message]),
    );
    return res
      .status(400)
      .json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Please correct the submitted fields.",
          fieldErrors,
        },
      });
  }
  if (error instanceof mongoose.Error.CastError)
    return res
      .status(400)
      .json({
        success: false,
        error: {
          code: "INVALID_ID",
          message: "A supplied identifier is invalid.",
        },
      });
  if (
    error instanceof mongoose.Error ||
    error instanceof mongoose.mongo.MongoError ||
    error?.name === "MongoNetworkError"
  ) {
    return res
      .status(503)
      .json({
        success: false,
        error: {
          code: "DATABASE_UNAVAILABLE",
          message: "The database is temporarily unavailable. Please try again.",
        },
      });
  }
  const status = error instanceof HttpError ? error.status : 500;
  const payload = {
    code: error instanceof HttpError ? error.code : "INTERNAL_ERROR",
    message:
      error instanceof HttpError
        ? error.message
        : "An unexpected server error occurred.",
  };
  if (error instanceof HttpError && error.fieldErrors)
    payload.fieldErrors = error.fieldErrors;
  if (status >= 500) console.error("Request failed:", error?.name || "Error");
  return res.status(status).json({ success: false, error: payload });
}
