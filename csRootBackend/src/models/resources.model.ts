
import mongoose, { Schema, Types } from "mongoose";
import type { HydratedDocument, Model } from "mongoose";

export type ResourceStatus = "draft" | "published" | "archived";

export type ResourceAssetPurpose = "content" | "cover";

export interface IResourceAsset {
    publicId: string;
    secureUrl: string;
    purpose: ResourceAssetPurpose;
    format?: string | undefined;
    bytes?: number | undefined;
    width?: number | undefined;
    height?: number | undefined;
    altText: string;
    caption: string;
}

export interface IResource {
    title: string;
    slug: string;
    description: string;
    subject: string;
    tags: string[];
    content: Record<string, any>;
    assets: IResourceAsset[];
    createdBy: Types.ObjectId;
    status: ResourceStatus;
    publishedAt: Date | null;
    isFeatured: boolean;
    viewCount: number;
    seo: {
        title: string;
        description: string;
    };
}

export type ResourceDocument = HydratedDocument<IResource>;

const resourceAssetSchema = new Schema<IResourceAsset>({
    publicId: {
        type: String,
        required: true,
        trim: true,
    },
    secureUrl: {
        type: String,
        required: true,
        trim: true,
    },
    purpose: {
        type: String,
        enum: ["content", "cover"],
        default: "content",
        required: true,
    },
    format: {
        type: String,
        trim: true,
    },
    bytes: {
        type: Number,
        min: 0,
    },
    width: {
        type: Number,
        min: 0,
    },
    height: {
        type: Number,
        min: 0,
    },
    altText: {
        type: String,
        trim: true,
        default: "",
    },
    caption: {
        type: String,
        trim: true,
        default: "",
    },
});

const resourceSchema = new Schema<IResource>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        description: {
            type: String,
            trim: true,
            default: "",
            maxlength: 500,
        },
        subject: {
            type: String,
            required: true,
            trim: true,
        },
        tags: {
            type: [String],
            default: [],
        },
        content: {
            type: Schema.Types.Mixed,
            required: true,
        },
        assets: {
            type: [resourceAssetSchema],
            default: [],
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        status: {
            type: String,
            enum: ["draft", "published", "archived"],
            default: "draft",
            required: true,
        },
        publishedAt: {
            type: Date,
            default: null,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        viewCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        seo: {
            title: {
                type: String,
                trim: true,
                default: "",
            },
            description: {
                type: String,
                trim: true,
                default: "",
            },
        },
    },
    {
        timestamps: true,
    }
);

resourceSchema.index({ subject: 1, status: 1 });
resourceSchema.index({ tags: 1, status: 1 });
resourceSchema.index({ createdBy: 1, createdAt: -1 });
resourceSchema.index({ status: 1, publishedAt: -1 });
resourceSchema.index({ isFeatured: 1, status: 1 });

export const Resource: Model<IResource> =
    (mongoose.models.Resource as Model<IResource>) ||
    mongoose.model<IResource>("Resource", resourceSchema);
