import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IFaq extends Document {
    question: string;
    answer: string;
    isActive: boolean;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

const faqSchema = new Schema<IFaq>({
    question: { type: String, required: true },
    answer: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
}, { timestamps: true });

export const FaqModel: Model<IFaq> = mongoose.model<IFaq>('Faq', faqSchema);
