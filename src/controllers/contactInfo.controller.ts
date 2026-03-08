import { Request, Response, NextFunction } from "express";
import ContactInfoModel from "../models/contactInfo.model";
import ErrorHandler from "../utils/ErrorHandler";

// Get Contact Info (There should only be one record)
export const getContactInfo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let contactInfo = await ContactInfoModel.findOne();

        // If none exists, return a default empty object to avoid errors on frontend
        if (!contactInfo) {
            return res.status(200).json({
                success: true,
                contactInfo: {
                    address_en: "Ta'ang Region, Northern Shan State",
                    address_mm: "တအာင်းဒေသ၊ ရှမ်းပြည်နယ်မြောက်ပိုင်း",
                    phone: "+95 9 123 456 789",
                    email: "contact@taang.gov.mm",
                    facebook: "",
                    twitter: "",
                    instagram: "",
                    working_hours_en: "Mon - Fri, 9:00 AM - 4:00 PM",
                    working_hours_mm: "တနင်္လာ - သောကြာ၊ နံနက် ၉ နာရီ - ညနေ ၄ နာရီ",
                }
            });
        }

        res.status(200).json({
            success: true,
            contactInfo,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
};

// Update or Create Contact Info
export const updateContactInfo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let contactInfo = await ContactInfoModel.findOne();

        if (contactInfo) {
            // Update existing
            contactInfo = await ContactInfoModel.findByIdAndUpdate(contactInfo._id, req.body, {
                new: true,
                runValidators: true,
            });
        } else {
            // Create first one
            contactInfo = await ContactInfoModel.create(req.body);
        }

        res.status(200).json({
            success: true,
            contactInfo,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
};
