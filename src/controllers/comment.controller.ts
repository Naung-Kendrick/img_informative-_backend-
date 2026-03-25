import { Request, Response, NextFunction } from "express";
import CommentModel from "../models/comment.model";
import ErrorHandler from "../utils/ErrorHandler";
import CatchAsyncError from "../middlewares/catchAsyncError";
import { logAudit, sanitizeForLog } from "../utils/AuditLogger";
import mongoose from "mongoose";

export const createComment = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const { newsId } = req.params;
        const { content } = req.body;
        const authorId = req.user?._id;

        if (!content) {
            return next(new ErrorHandler("Comment content is required", 400));
        }

        const comment = await CommentModel.create({
            content,
            newsId: new mongoose.Types.ObjectId(newsId as string),
            author: authorId,
        });

        if (comment) {
            await comment.populate('author', 'name avatar role');
        }

        res.status(201).json({
            success: true,
            comment,
        });
    }
);

export const getCommentsByNewsId = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const { newsId } = req.params;
        const comments = await CommentModel.find({ newsId: new mongoose.Types.ObjectId(newsId as string) })
            .populate('author', 'name avatar role')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            comments,
        });
    }
);

export const deleteComment = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const { commentId } = req.params;
        const currentUserId = req.user?._id;
        const currentUserRole = req.user?.role;

        const comment = await CommentModel.findById(commentId);

        if (!comment) {
            return next(new ErrorHandler("Comment not found", 404));
        }

        if (comment.author.toString() !== currentUserId.toString() && currentUserRole !== 3) {
            return next(new ErrorHandler("You are not authorized to delete this comment", 403));
        }

        const beforeData = comment.toObject();
        await comment.deleteOne();

        // Audit Log
        await logAudit({
            req,
            action: "DELETE",
            resourceType: "Comment",
            resourceId: commentId as string,
            actorId: currentUserId,
            actorName: req.user?.name || "Unknown",
            before: sanitizeForLog(beforeData),
            description: `Deleted comment by ${comment.author}: "${comment.content.substring(0, 50)}${comment.content.length > 50 ? '...' : ''}"`
        });

        res.status(200).json({
            success: true,
            message: "Comment deleted successfully"
        });
    }
);

export const updateComment = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const { commentId } = req.params;
        const { content } = req.body;
        const currentUserId = req.user?._id;

        if (!content) {
            return next(new ErrorHandler("Comment content is required", 400));
        }

        const comment = await CommentModel.findById(commentId);

        if (!comment) {
            return next(new ErrorHandler("Comment not found", 404));
        }

        if (comment.author.toString() !== currentUserId.toString()) {
            return next(new ErrorHandler("You are not authorized to edit this comment", 403));
        }

        const oldContent = comment.content;
        comment.content = content;
        await comment.save();

        // Audit Log
        if (oldContent !== content) {
            await logAudit({
                req,
                action: "UPDATE",
                resourceType: "Comment",
                resourceId: commentId as string,
                actorId: currentUserId,
                actorName: req.user?.name || "Unknown",
                before: { content: oldContent },
                after: { content: content },
                description: `Edited comment: "${oldContent.substring(0, 50)}..." -> "${content.substring(0, 50)}..."`
            });
        }

        await comment.populate('author', 'name avatar role');

        res.status(200).json({
            success: true,
            comment,
        });
    }
);
