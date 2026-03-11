import express from "express";
import { isAuthenticated, authorizeRoles } from "../middlewares/auth";
import { getAuditLogs, getAuditLogById } from "../controllers/auditLog.controller";

/**
 * 🛰️ Audit Log Routes
 * 🏗️ Securely exposing the chronological ledger to authorized administrators only.
 */
const router = express.Router();

// Admins (2) and Root Admins (3) can view audit trail
router.get("/", isAuthenticated, authorizeRoles([2, 3]), getAuditLogs);
router.get("/:id", isAuthenticated, authorizeRoles([2, 3]), getAuditLogById);

export default router;
