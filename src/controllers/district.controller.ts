import { Request, Response, NextFunction } from "express";
import DistrictModel from "../models/district.model";
import ErrorHandler from "../utils/ErrorHandler";

// Create a District
export const createDistrict = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, address, phone, mapUrl } = req.body;

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
            mapUrl,
            coverImage,
        });

        res.status(201).json({
            success: true,
            district,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message || 'Failed to create district', 500));
    }
};

// Retrieve all Districts
export const getAllDistricts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const districts = await DistrictModel.find().sort({ createdAt: 1 });

        res.status(200).json({
            success: true,
            districts,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message || 'Failed to fetch districts', 500));
    }
};

// Retrieve ONE District
export const getDistrictById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const district = await DistrictModel.findById(req.params.id);

        if (!district) {
            return next(new ErrorHandler("District not found.", 404));
        }

        res.status(200).json({
            success: true,
            district,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
};

// Update existing District
export const updateDistrict = async (req: Request, res: Response, next: NextFunction) => {
    try {
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
    } catch (error: any) {
        return next(new ErrorHandler(error.message || 'Failed to update district', 500));
    }
};

// Delete District
export const deleteDistrict = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const district = await DistrictModel.findByIdAndDelete(id);

        if (!district) {
            return next(new ErrorHandler("District not found.", 404));
        }

        res.status(200).json({
            success: true,
            message: "District deleted successfully.",
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message || 'Failed to delete district', 500));
    }
};
