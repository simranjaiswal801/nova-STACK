import "dotenv/config";
import { connectDatabase, disconnectDatabase } from "../config/database.js";
import { User } from "../models/User.js";

try {
  const { BOOTSTRAP_ADMIN_EMAIL: email, BOOTSTRAP_ADMIN_NAME: name, BOOTSTRAP_ADMIN_PASSWORD: password } = process.env;
  if (!email || !name || !password || password.length < 12 || Buffer.byteLength(password, "utf8") > 72 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) throw new Error("Set BOOTSTRAP_ADMIN_EMAIL, BOOTSTRAP_ADMIN_NAME and a 12+ character BOOTSTRAP_ADMIN_PASSWORD with upper/lowercase and a number (maximum 72 UTF-8 bytes) in server/.env.");
  await connectDatabase();
  const admins = await User.countDocuments({ role: "admin" });
  if (admins) { console.log("An admin account already exists. No account was changed."); }
  else {
    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) throw new Error("The requested admin email already belongs to a user. No account was changed.");
    await new User({ name, email, passwordHash: password, role: "admin" }).save();
    console.log("Initial NovaStack admin account created.");
  }
} catch (error) {
  console.error(error.message?.includes("MONGODB_URI") || error.message?.startsWith("Set ") || error.message?.startsWith("The requested") ? error.message : "Admin bootstrap failed. Check the database configuration.");
  process.exitCode = 1;
} finally { await disconnectDatabase(); }
