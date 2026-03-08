import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IReport extends Document {
    news: mongoose.Types.ObjectId;
    reporter?: mongoose.Types.ObjectId; // Optional for guest reports
    reason: string;
    details?: string;
    status: 'Pending' | 'Resolved' | 'Dismissed';
    isRead: boolean;
}

const reportSchema: Schema<IReport> = new mongoose.Schema(
    {
        news: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'news',
            required: true,
        },
        reporter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
        },
        reason: {
            type: String,
            required: true,
        },
        details: {
            type: String,
        },
        status: {
            type: String,
            enum: ['Pending', 'Resolved', 'Dismissed'],
            default: 'Pending',
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const reportModel: Model<IReport> = mongoose.model('reports', reportSchema);
export default reportModel;
