import { Request, Response, NextFunction } from "express";
import ContactInfoModel from "../models/contactInfo.model";
import ErrorHandler from "../utils/ErrorHandler";
import CatchAsyncError from "../middlewares/catchAsyncError";

// Get Contact Info (There should only be one record)
export const getContactInfo = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const contactInfo = await ContactInfoModel.findOne();

        if (!contactInfo) {
            return res.status(200).json({
                success: true,
                contactInfo: {
                    address_en: "Ta'ang Region, Northern Shan State",
                    address_mm: "တအာင်းဒေသ၊ ရှမ်းပြည်နယ်မြောက်ပိုင်း",
                    phone: "+95 9 123 456 789",
                    email: "contact@taang.gov.mm",
                    facebook: "",
                    telegram: "",
                    viber: "",
                    working_hours_en: "Mon - Fri, 9:00 AM - 4:00 PM",
                    working_hours_mm: "တနင်္လာ - သောကြာ၊ နံနက် ၉ နာရီ - ညနေ ၄ နာရီ",
                }
            });
        }

        res.status(200).json({
            success: true,
            contactInfo,
        });
    }
);

// Update or Create Contact Info
export const updateContactInfo = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const existingInfo = await ContactInfoModel.findOne();
        let contactInfo;

        if (existingInfo) {
            contactInfo = await ContactInfoModel.findByIdAndUpdate(existingInfo._id, req.body, {
                returnDocument: 'after',
                runValidators: true,
            });
        } else {
            contactInfo = await ContactInfoModel.create(req.body);
        }

        res.status(200).json({
            success: true,
            contactInfo,
        });
    }
);
