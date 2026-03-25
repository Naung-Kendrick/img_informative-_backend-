import { Request, Response, NextFunction } from "express";
import StatisticModel from "../models/statistic.model";
import ErrorHandler from "../utils/ErrorHandler";
import CatchAsyncError from "../middlewares/catchAsyncError";

// Create a Statistic
export const createStatistic = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const { title_en, title_mm, value, icon, date_en, date_mm, order } = req.body;

        if (!title_en || !title_mm || value === undefined) {
            return next(new ErrorHandler("Please enter all required fields", 400));
        }

        const statistic = await StatisticModel.create({
            title_en,
            title_mm,
            value,
            icon,
            date_en,
            date_mm,
            order,
        });

        res.status(201).json({
            success: true,
            statistic,
        });
    }
);

// Retrieve all Statistics
export const getAllStatistics = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const statistics = await StatisticModel.find().sort({ order: 1 });

        res.status(200).json({
            success: true,
            statistics,
        });
    }
);

// Retrieve specific Statistic by ID
export const getStatisticById = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const statistic = await StatisticModel.findById(req.params.id);

        if (!statistic) {
            return next(new ErrorHandler("Statistic not found", 404));
        }

        res.status(200).json({
            success: true,
            statistic,
        });
    }
);

// Update an existing Statistic
export const updateStatistic = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const statistic = await StatisticModel.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after', runValidators: true });

        if (!statistic) {
            return next(new ErrorHandler("Statistic not found", 404));
        }

        res.status(200).json({
            success: true,
            statistic,
        });
    }
);

// Delete a Statistic
export const deleteStatistic = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const statistic = await StatisticModel.findByIdAndDelete(req.params.id);

        if (!statistic) {
            return next(new ErrorHandler("Statistic not found", 404));
        }

        res.status(200).json({
            success: true,
            message: "Statistic deleted successfully"
        });
    }
);
