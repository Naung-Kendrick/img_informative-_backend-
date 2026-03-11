import mongoose, { Document, Model, Schema } from 'mongoose';

export interface INews extends Document {
    title: string;
    category: string;
    content: string; // The rich HTML from Tiptap
    images: string[];
    status: "Draft" | "Published";
    author: mongoose.Types.ObjectId; // The User who wrote it
    likes: mongoose.Types.ObjectId[]; // The Users who liked it
    views: number;
    district?: string;
    township?: string;
}

const newsSchema: Schema<INews> = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please enter the news title'],
        },
        category: {
            type: String,
            required: [true, 'Please select a category'],
        },
        content: {
            type: String,
            required: [true, 'Content is missing'],
        },
        images: {
            type: [String],
            default: [],
        },
        status: {
            type: String,
            enum: ["Draft", "Published", "Pending"],
            default: "Draft"
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            required: true,
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'users',
                default: [],
            }
        ],
        views: {
            type: Number,
            default: 0,
        },
        district: {
            type: String,
        },
        township: {
            type: String,
        }
    },
    { timestamps: true }
);

const newsModel: Model<INews> = mongoose.model('news', newsSchema);
export default newsModel;
