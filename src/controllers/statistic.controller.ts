import { Request, Response, NextFunction } from "express";
import StatisticModel from "../models/statistic.model";
import ErrorHandler from "../utils/ErrorHandler";

// Create a Statistic
export const createStatistic = async (req: Request, res: Response, next: NextFunction) => {
    try {
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
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
};

// Retrieve all Statistics
export const getAllStatistics = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const statistics = await StatisticModel.find().sort({ order: 1 });

        res.status(200).json({
            success: true,
            statistics,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
};

// Retrieve specific Statistic by ID
export const getStatisticById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const statistic = await StatisticModel.findById(req.params.id);

        if (!statistic) {
            return next(new ErrorHandler("Statistic not found", 404));
        }

        res.status(200).json({
            success: true,
            statistic,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
};

// Update an existing Statistic
export const updateStatistic = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const statistic = await StatisticModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

        if (!statistic) {
            return next(new ErrorHandler("Statistic not found", 404));
        }

        res.status(200).json({
            success: true,
            statistic,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
};

// Delete a Statistic
export const deleteStatistic = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const statistic = await StatisticModel.findByIdAndDelete(req.params.id);

        if (!statistic) {
            return next(new ErrorHandler("Statistic not found", 404));
        }

        res.status(200).json({
            success: true,
            message: "Statistic deleted successfully"
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
};
