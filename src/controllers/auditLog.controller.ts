import { Request, Response, NextFunction } from "express";
import AuditLogModel from "../models/auditLog.model";
import ErrorHandler from "../utils/ErrorHandler";
import CatchAsyncError from "../middlewares/catchAsyncError";

/**
 * 🛰️ Audit Log Controller
 * 🎯 Goal: Provide high-visibility chronological actions to admins.
 */

// @desc    Get all audit logs with pagination and filtering
export const getAuditLogs = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        // Build Filters
        const filter: Record<string, any> = {};
        if (req.query.resourceType) filter.resourceType = req.query.resourceType;
        if (req.query.action) filter.action = req.query.action;
        if (req.query.actorId) filter.performedBy = req.query.actorId;

        // Search in description
        if (req.query.search) {
            filter["details.description"] = { $regex: req.query.search as string, $options: "i" };
        }

        const total = await AuditLogModel.countDocuments(filter);
        const logs = await AuditLogModel.find(filter)
            .populate("performedBy", "name email avatar role")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            total,
            page,
            pages: Math.ceil(total / limit),
            logs
        });
    }
);

// @desc    Get specific log details (including before/after state)
export const getAuditLogById = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const log = await AuditLogModel.findById(req.params.id)
            .populate("performedBy", "name email avatar role");

        if (!log) {
            return next(new ErrorHandler("Audit log entry not found", 404));
        }

        res.status(200).json({
            success: true,
            log
        });
    }
);
