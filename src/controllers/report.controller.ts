import { Request, Response, NextFunction } from 'express';
import reportModel from '../models/report.model';
import newsModel from '../models/news.model';
import CatchAsyncError from '../middlewares/catchAsyncError';
import ErrorHandler from '../utils/ErrorHandler';

export const createReport = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const { newsId, reason, details } = req.body;
        const reporter = req.user?._id;

        const news = await newsModel.findById(newsId);
        if (!news) {
            return next(new ErrorHandler('News not found', 404));
        }

        const report = await reportModel.create({
            news: newsId,
            reporter: reporter || null,
            reason,
            details,
        });

        res.status(201).json({
            success: true,
            report,
        });
    }
);

export const getAllReports = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const reports = await reportModel.find()
            .populate('news', 'title category')
            .populate('reporter', 'name email avatar')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            reports,
        });
    }
);

export const markAsRead = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const report = await reportModel.findByIdAndUpdate(id, { isRead: true }, { returnDocument: 'after' });
        if (!report) {
            return next(new ErrorHandler('Report not found', 404));
        }
        res.status(200).json({
            success: true,
            report,
        });
    }
);

export const updateReportStatus = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const { status } = req.body;
        const report = await reportModel.findByIdAndUpdate(id, { status }, { returnDocument: 'after' });
        if (!report) {
            return next(new ErrorHandler('Report not found', 404));
        }
        res.status(200).json({
            success: true,
            report,
        });
    }
);

export const deleteReport = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const report = await reportModel.findByIdAndDelete(id);
        if (!report) {
            return next(new ErrorHandler('Report not found', 404));
        }
        res.status(200).json({
            success: true,
            message: 'Report deleted successfully'
        });
    }
);
