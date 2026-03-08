import { Request, Response, NextFunction } from "express";
import CatchAsyncError from "../middlewares/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import CategoryModel from "../models/category.model";

// Create category
export const createCategory = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { title, description } = req.body;

    if (!title) {
        return next(new ErrorHandler("Please enter category title", 400));
    }

    const slug = title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");

    const categoryExists = await CategoryModel.findOne({ slug });
    if (categoryExists) {
        return next(new ErrorHandler("Category already exists", 400));
    }

    const createdBy = req.user._id.toString();

    const category = await CategoryModel.create({
        title,
        slug,
        description,
        createdBy
    });

    res.status(201).json({
        success: true,
        category,
    });
});

// Get all categories
export const getAllCategories = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const categories = await CategoryModel.find().sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        categories,
    });
});

// Update category
export const updateCategory = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { title, description } = req.body;

    const category = await CategoryModel.findById(id);
    if (!category) {
        return next(new ErrorHandler("Category not found", 404));
    }

    if (title) {
        category.title = title;
        category.slug = title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");

        const categoryExists = await CategoryModel.findOne({ slug: category.slug, _id: { $ne: category._id } });
        if (categoryExists) {
            return next(new ErrorHandler("Category title already exists", 400));
        }
    }

    if (description !== undefined) {
        category.description = description;
    }

    const updatedCategory = await category.save();

    res.status(200).json({
        success: true,
        category: updatedCategory,
    });
});

// Delete category
export const deleteCategory = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const category = await CategoryModel.findById(id);
    if (!category) {
        return next(new ErrorHandler("Category not found", 404));
    }

    await category.deleteOne();

    res.status(200).json({
        success: true,
        message: "Category deleted successfully",
    });
});
