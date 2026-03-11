import { Request, Response, NextFunction } from "express";
import PageModel from "../models/page.model";
import ErrorHandler from "../utils/ErrorHandler";

// ── PUBLIC: Get all pages by section ──────────────────────────────────────
export const getPagesBySection = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const section = req.params.section as string;

        if (!['services', 'districts'].includes(section)) {
            return next(new ErrorHandler("Invalid section type", 400));
        }

        const pages = await PageModel.find({ section })
            .populate('author', 'name email avatar role')
            .sort({ order: 1, createdAt: -1 });

        res.status(200).json({
            success: true,
            pages,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message || "Failed to fetch pages", 500));
    }
};

// ── PUBLIC: Get a single page by ID ───────────────────────────────────────
export const getPageById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = await PageModel.findById(req.params.id)
            .populate('author', 'name email avatar role');

        if (!page) {
            return next(new ErrorHandler("Page not found", 404));
        }

        res.status(200).json({
            success: true,
            page,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message || "Failed to fetch page", 500));
    }
};

// ── ADMIN: Create a page ──────────────────────────────────────────────────
export const createPage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, content, section, status, bannerImage, order } = req.body;
        const authorId = req.user?._id;

        if (!title || !content || !section) {
            return next(new ErrorHandler("Please complete all required fields.", 400));
        }

        if (!['services', 'districts'].includes(section)) {
            return next(new ErrorHandler("Invalid section type", 400));
        }

        let finalStatus = status || "Draft";
        if (req.user?.role === 1 && finalStatus === "Published") {
            finalStatus = "Pending";
        }

        const page = await PageModel.create({
            title,
            content,
            section,
            status: finalStatus,
            bannerImage: bannerImage || '',
            author: authorId,
            order: order || 0,
        });

        res.status(201).json({
            success: true,
            page,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message || "Failed to create page", 500));
    }
};

// ── ADMIN: Update a page ──────────────────────────────────────────────────
export const updatePage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (req.user?.role === 1 && updateData.status === "Published") {
            updateData.status = "Pending";
        }

        const page = await PageModel.findByIdAndUpdate(id, updateData, {
            returnDocument: 'after',
            runValidators: true,
        });

        if (!page) {
            return next(new ErrorHandler("Page not found", 404));
        }

        res.status(200).json({
            success: true,
            page,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message || "Failed to update page", 500));
    }
};

// ── ADMIN: Delete a page ──────────────────────────────────────────────────
export const deletePage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = await PageModel.findByIdAndDelete(req.params.id);

        if (!page) {
            return next(new ErrorHandler("Page not found", 404));
        }

        res.status(200).json({
            success: true,
            message: "Page deleted successfully",
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message || "Failed to delete page", 500));
    }
};
