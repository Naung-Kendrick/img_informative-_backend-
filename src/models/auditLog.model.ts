import { model, Schema } from "mongoose";
import { IAuditLog } from "../types/IAuditLog";

/**
 * 🛰️ Audit Log MongoDB Schema
 * 🎯 Goal: Immutable chronological ledger of admin actions.
 */
const auditLogSchema: Schema<IAuditLog> = new Schema({
    action: {
        type: String,
        required: true,
        enum: ["CREATE", "UPDATE", "DELETE", "LOGIN", "AUTH_FAILED", "STATUS_CHANGE"]
    },
    resourceType: {
        type: String,
        required: true,
        enum: ["Announcement", "News", "Report", "User", "Comment", "Category", "Page", "District"]
    },
    resourceId: {
        type: String,
        index: true
    },
    performedBy: {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: true,
        index: true
    },
    actorName: {
        type: String,
        required: true
    },
    details: {
        before: { type: Schema.Types.Mixed },
        after: { type: Schema.Types.Mixed },
        description: { type: String, required: true }
    },
    ipAddress: {
        type: String,
    },
    userAgent: {
        type: String,
    }
}, {
    timestamps: { createdAt: true, updatedAt: false },
    // Ensure audit logs are essentially immutable - once created, shouldn't be edited via API.
    collection: "audit_logs"
});

// Optimized indexing for admin filtering
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ resourceType: 1, action: 1 });

const AuditLogModel = model<IAuditLog>("audit_logs", auditLogSchema);
export default AuditLogModel;
