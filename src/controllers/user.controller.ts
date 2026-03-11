import { NextFunction, Request, Response } from "express";
import CatchAsyncError from "../middlewares/catchAsyncError";
import { IUser } from "../types/IUser";
import ErrorHandler from "../utils/ErrorHandler";
import UserModel from "../models/user.model";
import { uploadS3 } from "../middlewares/upload";
import { OAuth2Client } from "google-auth-library";
import { logAudit, sanitizeForLog } from "../utils/AuditLogger";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Register User
export const register = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const { name, email, password, phone } = req.body as Partial<IUser>;

        if (!name || !email || !password) {
            return next(new ErrorHandler("Please enter all required fields", 400))
        }

        const normalizedEmail = email.toLowerCase();
        const isEmailExist = await UserModel.findOne({ email: normalizedEmail });
        if (isEmailExist) {
            return next(new ErrorHandler("Email already exists!", 400))
        }

        const user = await UserModel.create({ name, email: normalizedEmail, password, phone });
        const accessToken = await user.signAccessToken();

        res.status(201).json({
            success: true,
            accessToken,
            user,
        })
    }
);

// Login User
export const login = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const { email, password } = req.body as Partial<IUser>;

        if (!email || !password) {
            return next(new ErrorHandler("Please enter email and password", 400))
        }

        const normalizedEmail = email.toLowerCase();
        const user = await UserModel.findOne({ email: normalizedEmail }).select("+password");
        if (!user) {
            return next(new ErrorHandler("Invalid Credentials!", 403))
        }

        if (!user.active) {
            return next(new ErrorHandler("Your account has been deactivated. Please contact support.", 403))
        }

        const isPasswordMatch = await user.comparePassword(password);
        if (!isPasswordMatch) {
            return next(new ErrorHandler("Invalid Credentials!", 403))
        }

        user.lastLogin = new Date();
        await user.save();

        const accessToken = await user.signAccessToken();

        // Audit Log
        await logAudit({
            req,
            action: "LOGIN",
            resourceType: "User",
            resourceId: user._id.toString(),
            actorId: user._id,
            actorName: user.name,
            after: sanitizeForLog(user.toObject()),
            description: `User logged in: ${user.name} (${user.email})`
        });

        res.status(201).json({
            success: true,
            accessToken,
            user,
        })
    }
);

// Google Login
export const googleLogin = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const { credential } = req.body;

        if (!credential) {
            return next(new ErrorHandler("Google credential is required", 400));
        }

        let payload;
        try {
            const ticket = await googleClient.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            payload = ticket.getPayload();
        } catch (error) {
            return next(new ErrorHandler("Invalid Google Token", 401));
        }

        if (!payload) {
            return next(new ErrorHandler("Invalid Google Token", 401));
        }

        const { name, email, picture } = payload;

        const normalizedEmail = email.toLowerCase();
        let user = await UserModel.findOne({ email: normalizedEmail });

        if (!user) {
            // Auto-register user with default role (editor/user -> 1 represents user/editor in this schema usually, let's just use schema default 0)
            const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            user = await UserModel.create({
                name,
                email: normalizedEmail,
                password: randomPassword,
                avatar: picture,
                role: 0,
            });
        }

        if (!user.active) {
            return next(new ErrorHandler("Your account has been deactivated. Please contact support.", 403));
        }

        user.lastLogin = new Date();
        await user.save();

        const accessToken = await user.signAccessToken();

        // Audit Log
        await logAudit({
            req,
            action: "LOGIN",
            resourceType: "User",
            resourceId: user._id.toString(),
            actorId: user._id,
            actorName: user.name,
            after: sanitizeForLog(user.toObject()),
            description: `User logged in via Google: ${user.name} (${user.email})`
        });

        res.status(200).json({
            success: true,
            accessToken,
            user,
        });
    }
);
export const getCurrentUserInfo = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        if (!req.user._id) {
            return next(new ErrorHandler("User not found", 404));
        }

        res.status(200).json({
            success: true,
            user: req.user,
        })
    }
);

// Get User Info By Id
export const getUserById = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const user = await UserModel.findById(id);
        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        res.status(200).json({
            success: true,
            user,
        })
    }
);

// Get All Users
export const getAllUsers = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const users = await UserModel.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            users,
        })
    }
);

// Update user info
export const updateUserInfo = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const { name, email, phone, active } = req.body as Partial<IUser>;
        const currentUserId = req.user._id;

        // Select password to avoid issues with pre-save hook when calling .save()
        const user = await UserModel.findById(currentUserId).select("+password");
        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (typeof active === 'boolean') user.active = active;

        if (email && email.toLowerCase() !== user.email) {
            const normalizedEmail = email.toLowerCase();
            const isEmailExist = await UserModel.findOne({ email: normalizedEmail });
            if (isEmailExist) {
                return next(new ErrorHandler("Email already exists", 400));
            }
            user.email = normalizedEmail;
        }

        const updatedUser = await user.save();

        res.status(201).json({
            success: true,
            user: updatedUser,
        })
    }
);

// Update user password
type TUpdatePwdReq = {
    oldPassword: string;
    newPassword: string;
}
export const updateUserPassword = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const currentUserId = req.user._id;
        const { oldPassword, newPassword } = req.body as TUpdatePwdReq;
        if (!oldPassword || !newPassword) {
            return next(new ErrorHandler("Old and new passwords are required", 400));
        }

        const user = await UserModel.findById(currentUserId).select("+password");
        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        const isPasswordMatch = await user.comparePassword(oldPassword);
        if (!isPasswordMatch) {
            return next(new ErrorHandler("Incorrect old password", 400));
        }

        user.password = newPassword;
        const updatedUser = await user.save();

        // Important: return user without password in response
        const userObj = updatedUser.toObject();
        delete (userObj as any).password;

        res.status(201).json({
            success: true,
            user: userObj,
        })
    }
);

// Upload user avatar
export const uploadUserAvatar = [
    uploadS3.single("file"),
    CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
        const currentUserId = req.user._id;
        // AWS provides public URL natively inside location
        const file = req.file as Express.MulterS3.File;

        if (!file) {
            return next(new ErrorHandler("No file uploaded", 400));
        }

        const user = await UserModel.findById(currentUserId).select("+password");
        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        user.avatar = file.location;
        const updatedUser = await user.save();

        res.status(201).json({
            success: true,
            user: updatedUser,
        })
    })
]

// Update user role by admin
type TUpdateRoleReq = {
    userId: string;
    role: number;
}
export const updateUserRoleByAdmin = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const currentUserId = req.user._id.toString();
        const currentUserRole = req.user.role;
        const { userId, role } = req.body as TUpdateRoleReq;

        if (!userId || typeof role !== "number") {
            return next(new ErrorHandler("UserId and role are required", 400));
        }

        if (currentUserId === userId) {
            return next(new ErrorHandler("You can't change your role", 400));
        }

        const user = await UserModel.findById(userId).select("+password");
        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        if (currentUserRole === 2 && user.role >= 2) {
            return next(new ErrorHandler("You can't change this user role", 403));
        }

        // Allow Root_Admin (3) to change any role.
        // Prevent assigning role >= currentUserRole unless they are Root_Admin (optional logic but handled above partly)
        if (currentUserRole === 2 && role >= 2) {
            return next(new ErrorHandler("You can't promote a user to Admin or Root_Admin", 403));
        }

        const beforeData = await UserModel.findById(userId).lean();
        const oldRole = user.role;
        user.role = role;
        const updatedUser = await user.save();

        // Audit Log
        await logAudit({
            req,
            action: "UPDATE",
            resourceType: "User",
            resourceId: user._id.toString(),
            actorId: req.user?._id,
            actorName: req.user?.name || "Unknown",
            before: sanitizeForLog(beforeData),
            after: sanitizeForLog(updatedUser.toObject()),
            description: `Updated role for ${user.name}: ${oldRole} -> ${role}`
        });

        res.status(201).json({
            success: true,
            user: updatedUser,
        })
    }
);

// Update user password by admin
type TUpdatePwdByAdminReq = {
    userId: string;
    newPassword: string;
}
export const updateUserPwdByAdmin = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const currentUserRole = req.user.role;
        const { userId, newPassword } = req.body as TUpdatePwdByAdminReq;

        if (!userId || !newPassword) {
            return next(new ErrorHandler("UserId and password are required", 400));
        }

        const user = await UserModel.findById(userId).select("+password");
        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        if (currentUserRole === 2 && user.role >= 2) {
            return next(new ErrorHandler("You can't change this user password", 403));
        }

        user.password = newPassword;
        const updatedUser = await user.save();

        res.status(201).json({
            success: true,
            user: updatedUser,
        })
    }
);

// Delete user by admin
export const deleteUser = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const user = await UserModel.findById(id);
        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        await user.deleteOne();

        res.status(200).json({
            success: true,
            message: "User is deleted successfully!",
        })
    }
);

// Update user status by admin
type TUpdateStatusReq = {
    userId: string;
    active: boolean;
}
export const updateUserStatusByAdmin = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const currentUserRole = req.user.role;
        const { userId, active } = req.body as TUpdateStatusReq;

        if (!userId || typeof active !== "boolean") {
            return next(new ErrorHandler("UserId and status are required", 400));
        }

        // Only Root_Admin (3) can change status as per user request
        if (currentUserRole !== 3) {
            return next(new ErrorHandler("Only Root Admin can change user status", 403));
        }

        const user = await UserModel.findById(userId).select("+password");
        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        if (req.user._id.toString() === userId) {
            return next(new ErrorHandler("You can't change your own status", 400));
        }

        user.active = active;
        const updatedUser = await user.save();

        res.status(201).json({
            success: true,
            user: updatedUser,
        })
    }
);
