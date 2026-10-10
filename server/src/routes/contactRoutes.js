import { Router } from "express";
import { createContactMessage } from "../controllers/contactController.js";
import { verifyCsrfOrigin } from "../middleware/authenticate.js";
import { publicFormLimiter } from "../middleware/rateLimiter.js";
import { validateBody } from "../middleware/validateRequest.js";
import { contactSchema } from "../validators/contactValidators.js";

const router = Router();
router.post(
  "/",
  publicFormLimiter,
  verifyCsrfOrigin,
  validateBody(contactSchema),
  createContactMessage,
);
export default router;
