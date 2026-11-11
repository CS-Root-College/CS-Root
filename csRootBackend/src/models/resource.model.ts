
import mongoose, { Document, Schema } from "mongoose";

export interface IResource extends Document {
    title: string;
    slug: string;
    subject: string;
    description?: string;
    content: Record<string, any>;
    isPublished: boolean;
}

const resourceSchema = new Schema<IResource>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },

        subject: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
            default: "",
        },

        content: {
            type: Schema.Types.Mixed,
            required: true,
        },

        isPublished: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

resourceSchema.index({ subject: 1, isPublished: 1 });

export const Resource = mongoose.model<IResource>(
    "Resource",
    resourceSchema
);
