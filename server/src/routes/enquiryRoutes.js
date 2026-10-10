import { Router } from "express";
import {
  createEnquiry,
  listMyEnquiries,
} from "../controllers/enquiryController.js";
import {
  optionalAuth,
  requireAuth,
  verifyCsrfOrigin,
} from "../middleware/authenticate.js";
import { publicFormLimiter } from "../middleware/rateLimiter.js";
import { validateBody } from "../middleware/validateRequest.js";
import { enquirySchema } from "../validators/enquiryValidators.js";

const router = Router();
router.post(
  "/",
  publicFormLimiter,
  verifyCsrfOrigin,
  optionalAuth,
  validateBody(enquirySchema),
  createEnquiry,
);
router.get("/mine", requireAuth, listMyEnquiries);
export default router;
