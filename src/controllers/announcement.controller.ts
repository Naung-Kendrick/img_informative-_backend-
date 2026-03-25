import { Request, Response, NextFunction } from "express";
import AnnouncementModel from "../models/announcement.model";
import ErrorHandler from "../utils/ErrorHandler";
import CatchAsyncError from "../middlewares/catchAsyncError";
import { logAudit, sanitizeForLog } from "../utils/AuditLogger";
import { UserRole } from "../types/roles";

// Create an Announcement
export const createAnnouncement = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const { title, publishedDate, referenceNumber, status } = req.body;
        const authorId = req.user?._id;

        let finalStatus = status || "Draft";
        if (req.user?.role === UserRole.EDITOR && finalStatus === "Published") {
            finalStatus = "Pending";
        }

        if (!title || !publishedDate) {
            return next(new ErrorHandler("Please enter title and published date.", 400));
        }

        const files = req.files as Express.MulterS3.File[] | undefined;
        let documentImages: string[] = [];

        if (files && files.length > 0) {
            documentImages = files.map(file => file.location);
        } else if (req.body.documentImages) {
            documentImages = Array.isArray(req.body.documentImages) ? req.body.documentImages : [req.body.documentImages];
        }

        if (documentImages.length === 0) {
            return next(new ErrorHandler("Document images are missing.", 400));
        }

        const announcement = await AnnouncementModel.create({
            title,
            publishedDate,
            referenceNumber,
            documentImages,
            status: finalStatus,
            author: authorId,
        });

        // Audit Log
        await logAudit({
            req,
            action: "CREATE",
            resourceType: "Announcement",
            resourceId: announcement._id.toString(),
            actorId: req.user?._id,
            actorName: req.user?.name || "Unknown",
            after: sanitizeForLog(announcement.toObject()),
            description: `Created new announcement: "${announcement.title}"`
        });

        res.status(201).json({
            success: true,
            announcement,
        });
    }
);

// Retrieve all Announcements with pagination
export const getAllAnnouncements = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const total = await AnnouncementModel.countDocuments();
        const announcements = await AnnouncementModel.find()
            .sort({ publishedDate: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            announcements,
            total,
            page,
            limit
        });
    }
);

// Retrieve ONE Announcement
export const getAnnouncementById = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const announcement = await AnnouncementModel.findById(req.params.id);

        if (!announcement) {
            return next(new ErrorHandler("Announcement not found.", 404));
        }

        res.status(200).json({
            success: true,
            announcement,
        });
    }
);

// Update existing Announcement
export const updateAnnouncement = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const updateData = req.body;

        if (req.user?.role === UserRole.EDITOR && updateData.status === "Published") {
            updateData.status = "Pending";
        }

        const beforeData = await AnnouncementModel.findById(id).lean();
        if (!beforeData) {
            return next(new ErrorHandler("Announcement not found.", 404));
        }

        const announcement = await AnnouncementModel.findByIdAndUpdate(id, updateData, { returnDocument: 'after', runValidators: true });

        if (!announcement) {
            return next(new ErrorHandler("Announcement not found.", 404));
        }

        // Audit Log
        await logAudit({
            req,
            action: "UPDATE",
            resourceType: "Announcement",
            resourceId: announcement._id.toString(),
            actorId: req.user?._id,
            actorName: req.user?.name || "Unknown",
            before: sanitizeForLog(beforeData),
            after: sanitizeForLog(announcement.toObject()),
            description: `Updated announcement: "${announcement.title}"`
        });

        res.status(200).json({
            success: true,
            announcement,
        });
    }
);

// Delete Announcement
export const deleteAnnouncement = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;

        const announcement = await AnnouncementModel.findById(id).lean();

        if (!announcement) {
            return next(new ErrorHandler("Announcement not found.", 404));
        }

        await AnnouncementModel.findByIdAndDelete(id);

        // Audit Log
        await logAudit({
            req,
            action: "DELETE",
            resourceType: "Announcement",
            resourceId: id as string,
            actorId: req.user?._id,
            actorName: req.user?.name || "Unknown",
            before: sanitizeForLog(announcement),
            description: `Deleted announcement: "${announcement.title}"`
        });

        res.status(200).json({
            success: true,
            message: "Announcement deleted successfully.",
        });
    }
);

export const uploadAnnouncementImage = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const files = req.files as Express.MulterS3.File[] | undefined;

        if (!files || files.length === 0) {
            return next(new ErrorHandler("Please upload at least one file.", 400));
        }

        const urls = files.map(file => file.location);

        res.status(200).json({
            success: true,
            urls,
        });
    }
);
