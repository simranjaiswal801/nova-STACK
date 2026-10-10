import rateLimit from "express-rate-limit";

const makeLimiter = (limit, windowMs, message) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { success: false, error: { code: "RATE_LIMITED", message } },
  });
export const authLimiter = makeLimiter(
  10,
  15 * 60 * 1000,
  "Too many sign-in attempts. Please wait and try again.",
);
export const registrationLimiter = makeLimiter(
  10,
  60 * 60 * 1000,
  "Too many registration attempts. Please try again later.",
);
export const publicFormLimiter = makeLimiter(
  30,
  10 * 60 * 1000,
  "Too many submissions. Please wait before trying again.",
);
export const adminLimiter = makeLimiter(
  180,
  60 * 1000,
  "Too many admin requests. Please try again shortly.",
);
