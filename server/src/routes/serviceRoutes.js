import { Router } from "express";
import {
  publicServices,
  publicService,
} from "../controllers/adminController.js";
const router = Router();
router.get("/", publicServices);
router.get("/:slug", publicService);
export default router;
