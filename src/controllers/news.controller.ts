import { Request, Response, NextFunction } from "express";
import NewsModel from "../models/news.model";
import ErrorHandler from "../utils/ErrorHandler";
import { logAudit, sanitizeForLog } from "../utils/AuditLogger";

// Create an Article
export const createNews = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, category, content, status, images, district, township } = req.body;
        const authorId = req.user?._id;

        if (!title || !content || !category) {
            return next(new ErrorHandler("Please complete all required fields.", 400));
        }

        // Handle multiple files from req.files or URLs from req.body.images
        const files = req.files as Express.MulterS3.File[] | undefined;
        let resolvedImages: string[] = [];

        if (files && files.length > 0) {
            resolvedImages = files.map((file) => file.location);
        } else if (images) {
            resolvedImages = Array.isArray(images) ? images : [images];
        }

        let finalStatus = status || "Draft";
        if (req.user?.role === 1 && finalStatus === "Published") {
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
    } catch (error: any) {
        // 500 = server/DB error, not the client's fault
        return next(new ErrorHandler(error.message || 'Failed to create news', 500));
    }
};

// Retrieve all Articles — optionally filtered by ?category= query parameter
export const getAllNews = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Build dynamic filter: if ?category= is provided, filter by it
        const filter: Record<string, any> = {};
        if (req.query.category) {
            filter.category = req.query.category as string;
        }

        const news = await NewsModel.find(filter)
            .populate('author', 'name email avatar role')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            news,
        });
    } catch (error: any) {
        // 500 = DB/server failure, not client's fault
        return next(new ErrorHandler(error.message || 'Failed to fetch news', 500));
    }
};

// Retrieve just ONE Article by matching the /news/:id
export const getNewsById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const news = await NewsModel.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } },
            { returnDocument: 'after' }
        )
            .populate('author', 'name email avatar role')
            .populate('likes', 'name email avatar role'); // ADDED: Populate user info for Likes

        if (!news) {
            return next(new ErrorHandler("News article not found.", 404));
        }

        res.status(200).json({
            success: true,
            news,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
};

// Update an existing Article (Requires passing properties explicitly overriding DB document)
export const updateNews = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Handle multiple files if provided
        const files = req.files as Express.MulterS3.File[] | undefined;
        if (files && files.length > 0) {
            updateData.images = files.map((file) => file.location);
        }

        if (req.user?.role === 1 && updateData.status === "Published") {
            updateData.status = "Pending";
        }

        const beforeData = await NewsModel.findById(id).lean();
        const news = await NewsModel.findByIdAndUpdate(id, updateData, { returnDocument: 'after', runValidators: true });

        if (!news || !beforeData) {
            return next(new ErrorHandler("News not found", 404));
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
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
};

// Hard Delete Article Data
export const deleteNews = async (req: Request, res: Response, next: NextFunction) => {
    try {
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
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
};

// Image Upload Controller - multer-s3 middleware runs first on the route, populating req.files
export const uploadImage = (req: Request, res: Response, next: NextFunction) => {
    // AWS S3 provides the public URL inside req.files[].location (via multer-s3)
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
export const toggleLikeNews = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userId = req.user?._id;

        const news = await NewsModel.findById(id);
        if (!news) {
            return next(new ErrorHandler("News article not found.", 404));
        }

        // Check if user already liked the post
        const isLiked = news.likes.some((id: any) => id.toString() === userId.toString());

        if (isLiked) {
            // Unlike: Remove userId from likes array
            news.likes = news.likes.filter((id: any) => id.toString() !== userId.toString());
        } else {
            // Like: Add userId to likes array
            news.likes.push(userId);
        }

        await news.save();
        await news.populate('likes', 'name email avatar role'); // Populate to ensure UI reflects the user info

        res.status(200).json({
            success: true,
            news,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
};
