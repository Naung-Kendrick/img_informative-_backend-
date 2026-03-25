import { NextFunction, Request, Response } from "express";
import { FaqModel, IFaq } from "../models/faq.model";
import ErrorHandler from "../utils/ErrorHandler";
import CatchAsyncError from "../middlewares/catchAsyncError";

export const createFaq = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const { question, answer, isActive, order } = req.body as IFaq;
        const faq = await FaqModel.create({ question, answer, isActive, order });
        res.status(201).json({ success: true, faq });
    }
);

export const getAllFaqs = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const faqs = await FaqModel.find().sort({ order: 1, createdAt: -1 });
        res.status(200).json({ success: true, faqs });
    }
);

export const getFaqById = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const faq = await FaqModel.findById(req.params.id);
        if (!faq) return next(new ErrorHandler("Faq not found", 404));
        res.status(200).json({ success: true, faq });
    }
);

export const updateFaq = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const faq = await FaqModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!faq) return next(new ErrorHandler("Faq not found", 404));
        res.status(200).json({ success: true, faq });
    }
);

export const deleteFaq = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const faq = await FaqModel.findByIdAndDelete(req.params.id);
        if (!faq) return next(new ErrorHandler("Faq not found", 404));
        res.status(200).json({ success: true, message: "Faq deleted successfully" });
    }
);
