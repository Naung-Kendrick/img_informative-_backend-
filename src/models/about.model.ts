import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAbout extends Document {
    title: string;
    description: string;
    policy: string;
    objective: string;
    duty: string;
    mainTasks: string;
    theme: string;
    imageUrl: string;
    uniformDescription?: string;
    uniform1Image?: string;
    uniform1Name?: string;
    uniform2Image?: string;
    uniform2Name?: string;
}

const aboutSchema: Schema<IAbout> = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please enter the title'],
        },
        description: {
            type: String,
            required: [true, 'Please enter the description'],
        },
        policy: {
            type: String,
            required: [true, 'Please enter the policy'],
        },
        objective: {
            type: String,
            required: [true, 'Please enter the objective'],
        },
        duty: {
            type: String,
            required: [true, 'Please enter the duty'],
        },
        mainTasks: {
            type: String,
            required: [true, 'Please enter the main tasks'],
        },
        theme: {
            type: String,
            default: '',
        },
        imageUrl: {
            type: String,
            default: '',
        },
        uniformDescription: { type: String, default: '' },
        uniform1Image: { type: String, default: '' },
        uniform1Name: { type: String, default: '' },
        uniform2Image: { type: String, default: '' },
        uniform2Name: { type: String, default: '' }
    },
    { timestamps: true }
);

const aboutModel: Model<IAbout> = mongoose.model('About', aboutSchema);
export default aboutModel;
