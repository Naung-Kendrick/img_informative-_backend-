import { Request, Response, NextFunction } from "express";
import DistrictModel from "../models/district.model";
import ErrorHandler from "../utils/ErrorHandler";
import CatchAsyncError from "../middlewares/catchAsyncError";

// Create a District
export const createDistrict = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const { name, address, phone, mapUrl, officerInCharge } = req.body;

        if (!name || !address || !phone) {
            return next(new ErrorHandler("Please provide name, address, and phone.", 400));
        }

        const file = req.file as Express.MulterS3.File | undefined;
        let coverImage = req.body.coverImage;

        if (file) {
            coverImage = file.location;
        }

        if (!coverImage) {
            return next(new ErrorHandler("Cover image is missing.", 400));
        }

        const district = await DistrictModel.create({
            name,
            address,
            phone,
            officerInCharge,
            mapUrl,
            coverImage,
        });

        res.status(201).json({
            success: true,
            district,
        });
    }
);

// Retrieve all Districts
export const getAllDistricts = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const districts = await DistrictModel.find().sort({ order: 1, createdAt: 1 });

        res.status(200).json({
            success: true,
            districts,
        });
    }
);

// Retrieve ONE District
export const getDistrictById = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const district = await DistrictModel.findById(req.params.id);

        if (!district) {
            return next(new ErrorHandler("District not found.", 404));
        }

        res.status(200).json({
            success: true,
            district,
        });
    }
);

// Update existing District
export const updateDistrict = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const updateData = req.body;

        const file = req.file as Express.MulterS3.File | undefined;
        if (file) {
            updateData.coverImage = file.location;
        }

        const district = await DistrictModel.findByIdAndUpdate(id, updateData, { returnDocument: 'after', runValidators: true });

        if (!district) {
            return next(new ErrorHandler("District not found.", 404));
        }

        res.status(200).json({
            success: true,
            district,
        });
    }
);

// Delete District
export const deleteDistrict = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;

        const district = await DistrictModel.findByIdAndDelete(id);

        if (!district) {
            return next(new ErrorHandler("District not found.", 404));
        }

        res.status(200).json({
            success: true,
            message: "District deleted successfully.",
        });
    }
);

// Reorder Districts
export const reorderDistricts = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const districtsToReorder: { id: string; order: number }[] = req.body;

        if (!Array.isArray(districtsToReorder) || districtsToReorder.length === 0) {
            return next(new ErrorHandler("Invalid data format for reordering", 400));
        }

        const updatePromises = districtsToReorder.map(districtArr =>
            DistrictModel.findByIdAndUpdate(districtArr.id, { order: districtArr.order })
        );

        await Promise.all(updatePromises);

        res.status(200).json({
            success: true,
            message: "Districts reordered successfully.",
        });
    }
);
