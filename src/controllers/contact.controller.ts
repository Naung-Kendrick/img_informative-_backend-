import { Request, Response, NextFunction } from "express";
import ContactMessageModel from "../models/contact.model";
import ErrorHandler from "../utils/ErrorHandler";
import CatchAsyncError from "../middlewares/catchAsyncError";

// ── PUBLIC: Submit a contact message ──────────────────────────────────────
export const createContactMessage = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const { name, email, phone, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return next(new ErrorHandler("Please fill in all required fields.", 400));
        }

        const contact = await ContactMessageModel.create({
            name,
            email,
            phone,
            subject,
            message,
        });

        res.status(201).json({
            success: true,
            message: "Your message has been sent successfully.",
            contact,
        });
    }
);

// ── ADMIN: Get all contact messages ───────────────────────────────────────
export const getAllContactMessages = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const contacts = await ContactMessageModel.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            contacts,
        });
    }
);

// ── ADMIN: Mark a message as read ─────────────────────────────────────────
export const markAsRead = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const contact = await ContactMessageModel.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { returnDocument: 'after' }
        );

        if (!contact) {
            return next(new ErrorHandler("Message not found", 404));
        }

        res.status(200).json({
            success: true,
            contact,
        });
    }
);

// ── ADMIN: Delete a contact message ───────────────────────────────────────
export const deleteContactMessage = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const contact = await ContactMessageModel.findByIdAndDelete(req.params.id);

        if (!contact) {
            return next(new ErrorHandler("Message not found", 404));
        }

        res.status(200).json({
            success: true,
            message: "Message deleted successfully",
        });
    }
);
