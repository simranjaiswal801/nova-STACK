import { Router } from "express";
import { databaseReady } from "../config/database.js";

const router = Router();
router.get("/", (_req, res) => {
  const ready = databaseReady();
  return res
    .status(ready ? 200 : 503)
    .json({
      success: ready,
      data: {
        status: ready ? "ready" : "not_ready",
        database: ready ? "connected" : "disconnected",
      },
    });
});
export default router;
