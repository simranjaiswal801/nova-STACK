import { User } from "../models/User.js";
import { HttpError } from "../utils/httpError.js";

export async function changePassword(req, res) {
  const user = await User.findById(req.user._id).select(
    "+passwordHash +sessionVersion",
  );
  if (!user || !(await user.verifyPassword(req.validatedBody.currentPassword)))
    throw new HttpError(
      400,
      "CURRENT_PASSWORD_INVALID",
      "The current password is incorrect.",
    );
  user.passwordHash = req.validatedBody.newPassword;
  user.sessionVersion += 1;
  await user.save();
  const sameSite = (process.env.COOKIE_SAME_SITE || "lax").toLowerCase();
  res.clearCookie("novastack_session", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" || sameSite === "none",
    sameSite,
    path: "/",
  });
  res.json({
    success: true,
    data: {
      message: "Password updated. Sign in again with your new password.",
    },
  });
}
