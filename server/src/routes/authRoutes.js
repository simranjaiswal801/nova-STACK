import { Router } from "express";
import {
  register,
  registerInitialAdmin,
  login,
  currentUser,
  logout,
} from "../controllers/authController.js";
import { requireAuth, verifyCsrfOrigin } from "../middleware/authenticate.js";
import { authLimiter, registrationLimiter } from "../middleware/rateLimiter.js";
import { validateBody } from "../middleware/validateRequest.js";
import {
  loginSchema,
  registrationSchema,
  adminRegistrationSchema,
} from "../validators/authValidators.js";
import { changePassword } from "../controllers/settingsController.js";
import { passwordChangeSchema } from "../validators/adminValidators.js";

const router = Router();
router.post(
  "/register",
  registrationLimiter,
  verifyCsrfOrigin,
  validateBody(registrationSchema),
  register,
);
router.post(
  "/admin/register",
  registrationLimiter,
  verifyCsrfOrigin,
  validateBody(adminRegistrationSchema),
  registerInitialAdmin,
);
router.post(
  "/login",
  authLimiter,
  verifyCsrfOrigin,
  validateBody(loginSchema),
  login,
);
router.get("/me", requireAuth, currentUser);
router.post("/logout", verifyCsrfOrigin, requireAuth, logout);
router.post(
  "/password",
  verifyCsrfOrigin,
  requireAuth,
  validateBody(passwordChangeSchema),
  changePassword,
);
export default router;
