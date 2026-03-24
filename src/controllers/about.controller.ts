import { Request, Response, NextFunction } from "express";
import AboutModel from "../models/about.model";
import ErrorHandler from "../utils/ErrorHandler";

// ── PUBLIC: Get About Content ──────────────────────────────────────
export const getAboutContent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const about = await AboutModel.findOne().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            about: about || null,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message || "Failed to fetch about content", 500));
    }
};

// ── ADMIN: Create or Update About Content ──────────────────────────────────────────────────
export const saveAboutContent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { 
            title, description, policy, objective, duty, mainTasks, imageUrl,
            uniformDescription, uniform1Image, uniform1Name, uniform2Image, uniform2Name 
        } = req.body;

        if (!title || !description || !policy || !objective || !duty || !mainTasks) {
            return next(new ErrorHandler("Please fill out all required fields.", 400));
        }

        let about = await AboutModel.findOne();

        if (about) {
            about.title = title;
            about.description = description;
            about.policy = policy;
            about.objective = objective;
            about.duty = duty;
            about.mainTasks = mainTasks;
            if (imageUrl !== undefined) {
                about.imageUrl = imageUrl;
            }
            if (uniformDescription !== undefined) about.uniformDescription = uniformDescription;
            if (uniform1Image !== undefined) about.uniform1Image = uniform1Image;
            if (uniform1Name !== undefined) about.uniform1Name = uniform1Name;
            if (uniform2Image !== undefined) about.uniform2Image = uniform2Image;
            if (uniform2Name !== undefined) about.uniform2Name = uniform2Name;
            
            await about.save();
        } else {
            about = await AboutModel.create({
                title,
                description,
                policy,
                objective,
                duty,
                mainTasks,
                imageUrl: imageUrl || '',
                uniformDescription: uniformDescription || '',
                uniform1Image: uniform1Image || '',
                uniform1Name: uniform1Name || '',
                uniform2Image: uniform2Image || '',
                uniform2Name: uniform2Name || ''
            });
        }

        res.status(200).json({
            success: true,
            about,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message || "Failed to save about content", 500));
    }
};
