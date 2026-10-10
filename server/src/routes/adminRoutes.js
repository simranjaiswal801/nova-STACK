import { Router } from "express";
import * as admin from "../controllers/adminController.js";
import {
  requireAuth,
  requireRole,
  verifyCsrfOrigin,
} from "../middleware/authenticate.js";
import {
  validateBody,
  validateAdminQuery,
} from "../middleware/validateRequest.js";
import {
  serviceSchema,
  enquiryPatchSchema,
  userStatusSchema,
  messageReadSchema,
} from "../validators/adminValidators.js";
import { adminLimiter } from "../middleware/rateLimiter.js";

const router = Router();
router.use(requireAuth, requireRole("admin"), adminLimiter);
router.get("/dashboard", admin.dashboard);
router.get("/enquiries", validateAdminQuery("enquiries"), admin.listEnquiries);
router.get("/enquiries/:id", admin.getEnquiry);
router.patch(
  "/enquiries/:id",
  verifyCsrfOrigin,
  validateBody(enquiryPatchSchema),
  admin.updateEnquiry,
);
router.delete("/enquiries/:id", verifyCsrfOrigin, admin.deleteEnquiry);
router.get("/services", validateAdminQuery("services"), admin.listServices);
router.post(
  "/services",
  verifyCsrfOrigin,
  validateBody(serviceSchema),
  admin.createService,
);
router.patch(
  "/services/:id",
  verifyCsrfOrigin,
  validateBody(serviceSchema.partial()),
  admin.updateService,
);
router.delete("/services/:id", verifyCsrfOrigin, admin.deleteService);
router.get("/users", validateAdminQuery("users"), admin.listUsers);
router.get("/users/:id", admin.getUser);
router.patch(
  "/users/:id/status",
  verifyCsrfOrigin,
  validateBody(userStatusSchema),
  admin.setUserStatus,
);
router.get("/messages", validateAdminQuery("messages"), admin.listMessages);
router.patch(
  "/messages/:id/read-status",
  verifyCsrfOrigin,
  validateBody(messageReadSchema),
  admin.updateMessageRead,
);
router.delete("/messages/:id", verifyCsrfOrigin, admin.deleteMessage);
export default router;
