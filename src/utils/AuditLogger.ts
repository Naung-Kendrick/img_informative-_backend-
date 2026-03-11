import AuditLogModel from "../models/auditLog.model";
import { IAuditLog } from "../types/IAuditLog";
import { Request } from "express";

/**
 * 🛰️ Professional Audit Logger
 * 🎯 Goal: Capture state changes and agent context (IP, User Agent).
 */
export const logAudit = async ({
    req,
    action,
    resourceType,
    resourceId,
    actorId,
    actorName,
    before,
    after,
    description
}: {
    req?: Request;
    action: IAuditLog['action'];
    resourceType: IAuditLog['resourceType'];
    resourceId?: string;
    actorId: any;
    actorName: string;
    before?: any;
    after?: any;
    description: string;
}) => {
    try {
        // Extract context from Request object if provided
        const ipAddress = req?.ip || req?.headers['x-forwarded-for']?.toString() || "Unknown";
        const userAgent = req?.headers['user-agent'] || "Unknown";

        await AuditLogModel.create({
            action,
            resourceType,
            resourceId,
            performedBy: actorId,
            actorName,
            ipAddress,
            userAgent,
            details: {
                before,
                after,
                description
            }
        });
    } catch (err) {
        console.error("🔥 FAILED TO LOG AUDIT ENTRY:", err);
    }
};

/**
 * Helper to clean sensitive fields before logging state
 */
export const sanitizeForLog = (data: any) => {
    if (!data) return null;
    const sanitized = { ...data };

    // Privacy: Never log passwords or private tokens
    const sensitiveFields = ["password", "token", "otp", "secret", "privateKey"];
    sensitiveFields.forEach(f => delete sanitized[f]);

    return sanitized;
};
