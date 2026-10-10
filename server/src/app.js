import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import enquiryRoutes from "./routes/enquiryRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import { HttpError } from "./utils/httpError.js";

export function createApp() {
  const app = express();
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const parsedFrontendUrl = new URL(frontendUrl);
  if (parsedFrontendUrl.origin !== frontendUrl) throw new Error("FRONTEND_URL must be an exact origin without a path or trailing slash.");
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({
    origin(origin, callback) {
      if (!origin || origin === frontendUrl) return callback(null, true);
      return callback(new HttpError(403, "ORIGIN_NOT_ALLOWED", "This frontend origin is not allowed."));
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    maxAge: 600,
  }));
  app.use(express.json({ limit: "16kb", strict: true }));
  app.use(cookieParser());
  app.get("/", (_req, res) => res.json({ success: true, data: { name: "NovaStack API", version: "1.0.0" } }));
  app.use("/api/health", healthRoutes);
  app.use("/api/services", serviceRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/enquiries", enquiryRoutes);
  app.use("/api/contact", contactRoutes);
  app.use("/api", notFound);
  app.use(errorHandler);
  return app;
}
