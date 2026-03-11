import mongoose, { Document, Model, Schema } from "mongoose";

export interface ILayoutSection {
    sectionId: string;
    title: string;
    isVisible: boolean;
    order: number;
}

export interface ILayout extends Document {
    sections: ILayoutSection[];
}

const layoutSectionSchema = new Schema<ILayoutSection>({
    sectionId: { type: String, required: true },
    title: { type: String, required: true },
    isVisible: { type: Boolean, default: true },
    order: { type: Number, required: true },
}, { _id: false });

const layoutSchema = new Schema<ILayout>({
    sections: [layoutSectionSchema],
}, { timestamps: true });

const LayoutModel: Model<ILayout> = mongoose.model<ILayout>("Layout", layoutSchema);

export default LayoutModel;
