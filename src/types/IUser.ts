import { Document } from "mongoose";
import { UserRole } from "./roles";

export interface IUser extends Document {
    name: string;
    email: string;
    phone?: string;
    password: string;
    avatar?: string;
    role: UserRole;
    active: boolean;
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
    signAccessToken(): Promise<string>;
    comparePassword(enteredPassword: string): Promise<boolean>;
}