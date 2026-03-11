import { Document } from "mongoose";

export interface ICategory extends Document {
    title: string;
    slug: string;
    description?: string;
    order: number;
    createdBy: string; // The user ID who created the category
    createdAt: Date;
    updatedAt: Date;
}
