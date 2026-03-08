import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IPage extends Document {
    title: string;
    content: string;       // Rich HTML from TipTap
    bannerImage: string;   // S3 URL
    section: 'services' | 'districts';
    status: 'Draft' | 'Published';
    author: mongoose.Types.ObjectId;
    order: number;         // Manual sort order for CMS pages
}

const pageSchema: Schema<IPage> = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please enter the page title'],
            trim: true,
        },
        content: {
            type: String,
            required: [true, 'Content is required'],
        },
        bannerImage: {
            type: String,
            default: '',
        },
        section: {
            type: String,
            enum: ['services', 'districts'],
            required: [true, 'Section type is required'],
        },
        status: {
            type: String,
            enum: ['Draft', 'Published', 'Pending'],
            default: 'Draft',
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            required: true,
        },
        order: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

const PageModel: Model<IPage> = mongoose.model('Page', pageSchema);
export default PageModel;
