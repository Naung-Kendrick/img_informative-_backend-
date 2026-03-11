import { Document, Schema } from "mongoose";

/**
 * 🛰️ Professional Audit Trail Interface
 * 🎯 Goal: Maximum accountability with state tracking.
 */
export interface IAuditLog extends Document {
    action: "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "AUTH_FAILED" | "STATUS_CHANGE";
    resourceType: "Announcement" | "News" | "Report" | "User" | "Comment" | "Category" | "Page" | "District";
    resourceId?: string;
    performedBy: Schema.Types.ObjectId;
    actorName: string; // Redundancy for faster lookups & historical persistence
    details: {
        before?: any;
        after?: any;
        description: string;
    };
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
}
