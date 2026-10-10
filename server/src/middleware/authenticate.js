import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { HttpError } from "../utils/httpError.js";

const cookieName = "novastack_session";
function verifyToken(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32)
    throw new Error("JWT_SECRET must contain at least 32 characters");
  return jwt.verify(token, secret, { algorithms: ["HS256"] });
}
export async function optionalAuth(req, _res, next) {
  const token = req.cookies?.[cookieName];
  if (!token) return next();
  let payload;
  try {
    payload = verifyToken(token);
  } catch (error) {
    if (
      error?.name === "JsonWebTokenError" ||
      error?.name === "TokenExpiredError" ||
      error?.name === "NotBeforeError"
    )
      return next(
        new HttpError(
          401,
          "UNAUTHENTICATED",
          "Your session is invalid or has expired.",
        ),
      );
    return next(error);
  }
  try {
    const user = await User.findById(payload.sub).select(
      "name email role active +sessionVersion",
    );
    if (!user)
      return next(
        new HttpError(
          401,
          "UNAUTHENTICATED",
          "Your session is no longer valid.",
        ),
      );
    if (!user.active)
      return next(
        new HttpError(401, "UNAUTHENTICATED", "This account is inactive."),
      );
    if ((payload.sv || 0) !== user.sessionVersion)
      return next(
        new HttpError(
          401,
          "UNAUTHENTICATED",
          "Your session is no longer valid.",
        ),
      );
    req.user = user;
    return next();
  } catch (error) {
    if (error?.name === "CastError")
      return next(
        new HttpError(
          401,
          "UNAUTHENTICATED",
          "Your session is invalid or has expired.",
        ),
      );
    return next(error);
  }
}
export function requireAuth(req, res, next) {
  optionalAuth(req, res, (error) => {
    if (error) return next(error);
    if (!req.user)
      return next(
        new HttpError(
          401,
          "UNAUTHENTICATED",
          "Sign in to access this resource.",
        ),
      );
    next();
  });
}
export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user)
      return next(
        new HttpError(
          401,
          "UNAUTHENTICATED",
          "Sign in to access this resource.",
        ),
      );
    if (!roles.includes(req.user.role))
      return next(
        new HttpError(
          403,
          "FORBIDDEN",
          "You do not have permission to access this resource.",
        ),
      );
    next();
  };
}
export function verifyCsrfOrigin(req, _res, next) {
  const safeMethod = ["GET", "HEAD", "OPTIONS"].includes(req.method);
  const hasSessionCookie = Boolean(req.cookies?.[cookieName]);
  if (safeMethod || !hasSessionCookie) return next();
  const trusted = process.env.FRONTEND_URL || "http://localhost:5173";
  if (req.get("origin") !== trusted)
    return next(
      new HttpError(
        403,
        "CSRF_ORIGIN_REJECTED",
        "The request origin could not be verified.",
      ),
    );
  next();
}
export function sessionCookie(token) {
  const sameSite = (process.env.COOKIE_SAME_SITE || "lax").toLowerCase();
  return {
    name: cookieName,
    token,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" || sameSite === "none",
      sameSite,
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  };
}
