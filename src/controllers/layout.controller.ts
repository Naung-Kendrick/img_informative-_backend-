import { NextFunction, Request, Response } from "express";
import LayoutModel from "../models/layout.model";
import ErrorHandler from "../utils/ErrorHandler";
import CatchAsyncError from "../middlewares/catchAsyncError";

const DEFAULT_SECTIONS = [
    { sectionId: "hero", title: "Hero Banner", isVisible: true, order: 1 },
    { sectionId: "stats", title: "Statistics Section", isVisible: true, order: 2 },
    { sectionId: "services", title: "Featured Services", isVisible: true, order: 3 },
    { sectionId: "districts", title: "Regional Districts", isVisible: true, order: 4 },
    { sectionId: "news", title: "Latest Official News", isVisible: true, order: 5 },
    { sectionId: "announcements", title: "Official Announcements", isVisible: true, order: 6 },
];

export const getLayout = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    let layout = await LayoutModel.findOne();
    if (!layout) {
        layout = await LayoutModel.create({ sections: DEFAULT_SECTIONS });
    } else {
        // Also ensure any newly added defaults are present.
        const currentSectionIds = new Set(layout.sections.map(s => s.sectionId));
        let updated = false;
        
        DEFAULT_SECTIONS.forEach(defaultSection => {
            if (!currentSectionIds.has(defaultSection.sectionId)) {
                layout.sections.push(defaultSection);
                updated = true;
            }
        });
        
        if (updated) {
            await layout.save();
        }
    }

    res.status(200).json({
        success: true,
        sections: layout.sections,
    });
});

export const updateLayout = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { sections } = req.body;
    
    if (!sections || !Array.isArray(sections)) {
        return next(new ErrorHandler("Invalid layout sections provided", 400));
    }

    let layout = await LayoutModel.findOne();
    if (!layout) {
        layout = new LayoutModel({ sections });
    } else {
        layout.sections = sections;
    }

    await layout.save();

    res.status(200).json({
        success: true,
        message: "Layout updated successfully",
        sections: layout.sections,
    });
});
