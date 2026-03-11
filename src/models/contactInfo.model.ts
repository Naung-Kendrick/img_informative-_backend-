import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IContactInfo extends Document {
    address_en: string;
    address_mm: string;
    phone: string;
    email: string;
    facebook: string;
    telegram: string;
    viber: string;
    working_hours_en: string;
    working_hours_mm: string;
    map_embed_url: string;
}

const contactInfoSchema: Schema<IContactInfo> = new mongoose.Schema(
    {
        address_en: { type: String, required: true },
        address_mm: { type: String, required: true },
        phone: { type: String, required: true },
        email: { type: String, required: true },
        facebook: { type: String, default: "" },
        telegram: { type: String, default: "" },
        viber: { type: String, default: "" },
        working_hours_en: { type: String, default: "" },
        working_hours_mm: { type: String, default: "" },
        map_embed_url: { type: String, default: "" },
    },
    { timestamps: true }
);

const contactInfoModel: Model<IContactInfo> = mongoose.model('ContactInfo', contactInfoSchema);
export default contactInfoModel;
