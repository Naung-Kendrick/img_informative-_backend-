import { Request, Response, NextFunction } from "express";
import PageModel from "../models/page.model";
import ErrorHandler from "../utils/ErrorHandler";
import CatchAsyncError from "../middlewares/catchAsyncError";

// ── PUBLIC: Get all pages by section ──────────────────────────────────────
export const getPagesBySection = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
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
    }
);

// ── PUBLIC: Get a single page by ID ───────────────────────────────────────
export const getPageById = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const page = await PageModel.findById(req.params.id)
            .populate('author', 'name email avatar role');

        if (!page) {
            return next(new ErrorHandler("Page not found", 404));
        }

        res.status(200).json({
            success: true,
            page,
        });
    }
);

// ── ADMIN: Create a page ──────────────────────────────────────────────────
export const createPage = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
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
    }
);

// ── ADMIN: Update a page ──────────────────────────────────────────────────
export const updatePage = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
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
    }
);

// ── ADMIN: Delete a page ──────────────────────────────────────────────────
export const deletePage = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const page = await PageModel.findByIdAndDelete(req.params.id);

        if (!page) {
            return next(new ErrorHandler("Page not found", 404));
        }

        res.status(200).json({
            success: true,
            message: "Page deleted successfully",
        });
    }
);
