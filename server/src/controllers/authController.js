import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { timingSafeEqual } from "node:crypto";
import { User } from "../models/User.js";
import { HttpError } from "../utils/httpError.js";
import { sessionCookie } from "../middleware/authenticate.js";

function createSession(user, res) {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32)
    throw new Error("JWT_SECRET must contain at least 32 characters");
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  const token = jwt.sign(
    { sub: user.id, sv: user.sessionVersion || 0 },
    secret,
    { algorithm: "HS256", expiresIn },
  );
  const cookie = sessionCookie(token);
  res.cookie(cookie.name, cookie.token, cookie.options);
}

export async function register(req, res) {
  const { name, email, password } = req.validatedBody;
  const user = new User({ name, email, passwordHash: password });
  try {
    await user.save();
  } catch (error) {
    if (error?.code === 11000)
      throw new HttpError(
        409,
        "EMAIL_IN_USE",
        "An account with this email already exists.",
      );
    throw error;
  }
  createSession(user, res);
  return res.status(201).json({ success: true, data: { user: user.toJSON() } });
}

export async function registerInitialAdmin(req, res) {
  const { name, email, password, setupKey } = req.validatedBody;
  const configuredKey = process.env.ADMIN_SETUP_KEY || "";
  const provided = Buffer.from(setupKey);
  const expected = Buffer.from(configuredKey);
  if (
    expected.length < 32 ||
    provided.length !== expected.length ||
    !timingSafeEqual(provided, expected)
  ) {
    throw new HttpError(
      403,
      "ADMIN_SETUP_UNAVAILABLE",
      "Admin registration is unavailable. Check the setup key or use the server bootstrap command.",
    );
  }
  if (await User.exists({ role: "admin" }))
    throw new HttpError(
      403,
      "ADMIN_REGISTRATION_CLOSED",
      "An administrator already exists. Admin registration is closed.",
    );

  // A unique MongoDB lock makes this first-admin setup one-time, including concurrent requests.
  const setupCollection = mongoose.connection.collection("admin_setup");
  try {
    await setupCollection.insertOne({
      _id: "initial-admin-registration",
      createdAt: new Date(),
    });
  } catch (error) {
    if (error?.code === 11000)
      throw new HttpError(
        403,
        "ADMIN_REGISTRATION_CLOSED",
        "Admin registration has already been used or an administrator already exists.",
      );
    throw error;
  }

  try {
    const user = new User({
      name,
      email,
      passwordHash: password,
      role: "admin",
    });
    await user.save();
    createSession(user, res);
    return res
      .status(201)
      .json({ success: true, data: { user: user.toJSON() } });
  } catch (error) {
    await setupCollection
      .deleteOne({ _id: "initial-admin-registration" })
      .catch(() => {});
    if (error?.code === 11000)
      throw new HttpError(
        409,
        "EMAIL_IN_USE",
        "An account with this email already exists.",
      );
    throw error;
  }
}

export async function login(req, res) {
  const { email, password } = req.validatedBody;
  const user = await User.findOne({ email }).select(
    "+passwordHash +sessionVersion",
  );
  const passwordMatches = user ? await user.verifyPassword(password) : false;
  if (!user || !passwordMatches || !user.active)
    throw new HttpError(
      401,
      "INVALID_CREDENTIALS",
      "Email or password is incorrect.",
    );
  createSession(user, res);
  return res.json({ success: true, data: { user: user.toJSON() } });
}

export function currentUser(req, res) {
  return res.json({ success: true, data: { user: req.user.toJSON() } });
}

export async function logout(req, res) {
  await User.updateOne({ _id: req.user._id }, { $inc: { sessionVersion: 1 } });
  const sameSite = (process.env.COOKIE_SAME_SITE || "lax").toLowerCase();
  res.clearCookie("novastack_session", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" || sameSite === "none",
    sameSite,
    path: "/",
  });
  return res.json({ success: true, data: { loggedOut: true } });
}
