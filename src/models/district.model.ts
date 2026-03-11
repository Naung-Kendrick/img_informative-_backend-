import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IDistrict extends Document {
    name: string;
    coverImage: string;
    address: string;
    phone: string;
    officerInCharge?: string;
    mapUrl?: string;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

const districtSchema: Schema<IDistrict> = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please enter the district name'],
        },
        coverImage: {
            type: String,
            required: [true, 'Cover image is missing'],
        },
        address: {
            type: String,
            required: [true, 'Address is missing'],
        },
        phone: {
            type: String,
            required: [true, 'Phone number is missing'],
        },
        officerInCharge: {
            type: String,
        },
        mapUrl: {
            type: String,
        },
        order: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

const districtModel: Model<IDistrict> = mongoose.model('districts', districtSchema);
export default districtModel;
