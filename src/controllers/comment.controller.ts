import { Request, Response, NextFunction } from "express";
import CommentModel from "../models/comment.model";
import ErrorHandler from "../utils/ErrorHandler";
import { logActivity } from "../utils/AuditLogger";

export const createComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { newsId } = req.params;
        const { content } = req.body;

        // This is safe because req.user is appended by isAuthenticated middleware
        const authorId = req.user?._id;

        if (!content) {
            return next(new ErrorHandler("Comment content is required", 400));
        }

        const comment = await CommentModel.create({
            content,
            newsId: newsId as any,
            author: authorId as any,
        });

        // We run populate dynamically right after creation so the Frontend gets the updated name+avatar immediately
        if (comment) {
            await (comment as any).populate('author', 'name avatar role');
        }

        res.status(201).json({
            success: true,
            comment,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
};

export const getCommentsByNewsId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { newsId } = req.params;
        // Fetch all comments matching News ID, populate authors, limit payload
        const comments = await CommentModel.find({ newsId })
            .populate('author', 'name avatar role')
            .sort({ createdAt: -1 }); // Sort by newest first

        res.status(200).json({
            success: true,
            comments,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
};

export const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { commentId } = req.params;
        const currentUserId = req.user?._id;
        const currentUserRole = req.user?.role;

        const comment = await CommentModel.findById(commentId);

        if (!comment) {
            return next(new ErrorHandler("Comment not found", 404));
        }

        // Allow delete only if user is author OR Root Admin (3)
        if (comment.author.toString() !== currentUserId.toString() && currentUserRole !== 3) {
            return next(new ErrorHandler("You are not authorized to delete this comment", 403));
        }

        await comment.deleteOne();

        // Audit Log
        await logActivity(
            "DELETE_COMMENT",
            req.user?._id,
            `Deleted comment by ${comment.author}: "${comment.content.substring(0, 50)}${comment.content.length > 50 ? '...' : ''}"`,
            { id: commentId as string, type: "COMMENT" },
            req.ip as string
        );

        res.status(200).json({
            success: true,
            message: "Comment deleted successfully"
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
};

export const updateComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
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

        // Author Check — Root Admin can delete, but shouldn't really edit others' comments
        if (comment.author.toString() !== currentUserId.toString()) {
            return next(new ErrorHandler("You are not authorized to edit this comment", 403));
        }

        const oldContent = comment.content;
        comment.content = content;
        await comment.save();

        // Audit Log
        if (oldContent !== content) {
            await logActivity(
                "EDIT_COMMENT",
                req.user?._id,
                `Edited comment: "${oldContent.substring(0, 50)}..." -> "${content.substring(0, 50)}..."`,
                { id: commentId as string, type: "COMMENT" },
                req.ip as string
            );
        }

        // Populate and return
        await (comment as any).populate('author', 'name avatar role');

        res.status(200).json({
            success: true,
            comment,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
};
