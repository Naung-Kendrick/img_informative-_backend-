import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IStatistic extends Document {
    title_en: string;
    title_mm: string;
    value: number;
    icon: string;
    date_en?: string;
    date_mm?: string;
    order: number;
}

const statisticSchema: Schema<IStatistic> = new mongoose.Schema(
    {
        title_en: {
            type: String,
            required: [true, 'Please enter the English title'],
        },
        title_mm: {
            type: String,
            required: [true, 'Please enter the Myanmar title'],
        },
        value: {
            type: Number,
            required: [true, 'Please enter the numeric value'],
        },
        icon: {
            type: String,
            default: 'Activity', // Fallback icon name
        },
        date_en: {
            type: String,
        },
        date_mm: {
            type: String,
        },
        order: {
            type: Number,
            default: 0,
        }
    },
    { timestamps: true }
);

const statisticModel: Model<IStatistic> = mongoose.model('statistic', statisticSchema);
export default statisticModel;
