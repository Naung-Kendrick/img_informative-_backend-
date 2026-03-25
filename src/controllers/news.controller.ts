import { Request, Response, NextFunction } from "express";
import NewsModel from "../models/news.model";
import ErrorHandler from "../utils/ErrorHandler";
import CatchAsyncError from "../middlewares/catchAsyncError";
import { logAudit, sanitizeForLog } from "../utils/AuditLogger";
import { UserRole } from "../types/roles";

// Create an Article
export const createNews = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const { title, category, content, status, images, district, township } = req.body;
        const authorId = req.user?._id;

        if (!title || !content || !category) {
            return next(new ErrorHandler("Please complete all required fields.", 400));
        }

        const files = req.files as Express.MulterS3.File[] | undefined;
        let resolvedImages: string[] = [];

        if (files && files.length > 0) {
            resolvedImages = files.map((file) => file.location);
        } else if (images) {
            resolvedImages = Array.isArray(images) ? images : [images];
        }

        let finalStatus = status || "Draft";
        if (req.user?.role === UserRole.EDITOR && finalStatus === "Published") {
            finalStatus = "Pending";
        }

        const news = await NewsModel.create({
            title,
            category,
            content,
            status: finalStatus,
            images: resolvedImages,
            author: authorId,
            district,
            township
        });

        res.status(201).json({
            success: true,
            news,
        });
    }
);

// Retrieve all Articles — optionally filtered by ?category= query parameter with pagination
export const getAllNews = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const filter: Record<string, string | number | boolean | object> = {};
        if (req.query.category) {
            filter.category = req.query.category as string;
        }

        const total = await NewsModel.countDocuments(filter);
        const news = await NewsModel.find(filter)
            .populate('author', 'name email avatar role')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            news,
            total,
            page,
            limit
        });
    }
);

// Retrieve just ONE Article by matching the /news/:id
export const getNewsById = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const news = await NewsModel.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } },
            { returnDocument: 'after' }
        )
            .populate('author', 'name email avatar role')
            .populate('likes', 'name email avatar role');

        if (!news) {
            return next(new ErrorHandler("News article not found.", 404));
        }

        res.status(200).json({
            success: true,
            news,
        });
    }
);

// Update an existing Article
export const updateNews = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const updateData = req.body;

        const files = req.files as Express.MulterS3.File[] | undefined;
        if (files && files.length > 0) {
            updateData.images = files.map((file) => file.location);
        }

        if (req.user?.role === UserRole.EDITOR && updateData.status === "Published") {
            updateData.status = "Pending";
        }

        const beforeData = await NewsModel.findById(id).lean();
        if (!beforeData) {
            return next(new ErrorHandler("News not found", 404));
        }

        const news = await NewsModel.findByIdAndUpdate(id, updateData, { returnDocument: 'after', runValidators: true });

        if (!news) {
            return next(new ErrorHandler("News could not be updated", 400));
        }

        // Audit Log
        await logAudit({
            req,
            action: "UPDATE",
            resourceType: "News",
            resourceId: news._id.toString(),
            actorId: req.user?._id,
            actorName: req.user?.name || "Unknown",
            before: sanitizeForLog(beforeData),
            after: sanitizeForLog(news.toObject()),
            description: `Updated news article: "${news.title}"`
        });

        res.status(200).json({
            success: true,
            news,
        });
    }
);

// Hard Delete Article Data
export const deleteNews = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const news = await NewsModel.findById(req.params.id).lean();

        if (!news) {
            return next(new ErrorHandler("News not found", 404));
        }

        await NewsModel.findByIdAndDelete(req.params.id);

        // Audit Log
        await logAudit({
            req,
            action: "DELETE",
            resourceType: "News",
            resourceId: news._id.toString(),
            actorId: req.user?._id,
            actorName: req.user?.name || "Unknown",
            before: sanitizeForLog(news),
            description: `Deleted news article: "${news.title}"`
        });

        res.status(200).json({
            success: true,
            message: "News deleted successfully"
        });
    }
);

// Image Upload Controller
export const uploadImage = (req: Request, res: Response, next: NextFunction) => {
    const files = req.files as Express.MulterS3.File[];
    if (!files || files.length === 0) {
        return next(new ErrorHandler("No image files provided.", 400));
    }

    const urls = files.map((file) => file.location);

    res.status(200).json({
        success: true,
        urls: urls,
    });
};

// Toggle Love/Like
export const toggleLikeNews = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const userId = req.user?._id;

        if (!userId) {
            return next(new ErrorHandler("Login Required", 401));
        }

        const news = await NewsModel.findById(id);
        if (!news) {
            return next(new ErrorHandler("News article not found.", 404));
        }

        // Check if user already liked the post
        const isLiked = news.likes.some((lId) => lId.toString() === userId.toString());

        if (isLiked) {
            news.likes = news.likes.filter((lId) => lId.toString() !== userId.toString());
        } else {
            news.likes.push(userId);
        }

        await news.save();
        await news.populate('likes', 'name email avatar role');

        res.status(200).json({
            success: true,
            news,
        });
    }
);
