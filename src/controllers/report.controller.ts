import { Request, Response } from 'express';
import reportModel from '../models/report.model';
import newsModel from '../models/news.model';

export const createReport = async (req: Request, res: Response) => {
    try {
        const { newsId, reason, details } = req.body;
        const reporter = (req as any).user?._id; // User from JWT middleware

        // Validate News
        const news = await newsModel.findById(newsId);
        if (!news) {
            return res.status(404).json({ message: 'News not found' });
        }

        const report = await reportModel.create({
            news: newsId,
            reporter: reporter || null, // Handle guest if necessary
            reason,
            details,
        });

        res.status(201).json(report);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllReports = async (req: Request, res: Response) => {
    try {
        const reports = await reportModel.find()
            .populate('news', 'title category')
            .populate('reporter', 'name email avatar')
            .sort({ createdAt: -1 });

        res.status(200).json(reports);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const markAsRead = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const report = await reportModel.findByIdAndUpdate(id, { isRead: true }, { returnDocument: 'after' });
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }
        res.status(200).json(report);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateReportStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const report = await reportModel.findByIdAndUpdate(id, { status }, { returnDocument: 'after' });
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }
        res.status(200).json(report);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteReport = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const report = await reportModel.findByIdAndDelete(id);
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }
        res.status(200).json({ message: 'Report deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
