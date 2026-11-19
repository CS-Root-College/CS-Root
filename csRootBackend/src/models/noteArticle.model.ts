
import mongoose, { Schema } from "mongoose";
import type { Model, Types } from "mongoose";

export type NoteArticleStatus = "draft" | "published";

export interface INoteContentBlock {
  type: "heading" | "paragraph" | "image" | "list" | "code" | "quote";
  content?: string;
  items?: string[];
  url?: string;
  caption?: string;
  language?: string;
}

export interface INoteArticle {
  topic: Types.ObjectId;
  title: string;
  content: INoteContentBlock[];
  status: NoteArticleStatus;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  publishedAt: Date | null;
}

const noteContentBlockSchema = new Schema<INoteContentBlock>(
  {
    type: {
      type: String,
      enum: ["heading", "paragraph", "image", "list", "code", "quote"],
      required: true,
    },
    content: String,
    items: {
      type: [String],
      default: undefined,
    },
    url: String,
    caption: String,
    language: String,
  },
  {
    _id: false,
  }
);

const noteArticleSchema = new Schema<INoteArticle>(
  {
    topic: {
      type: Schema.Types.ObjectId,
      ref: "NoteTopic",
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: [noteContentBlockSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

noteArticleSchema.index({ status: 1, publishedAt: -1 });

export const NoteArticle: Model<INoteArticle> =
  (mongoose.models.NoteArticle as Model<INoteArticle>) ||
  mongoose.model<INoteArticle>("NoteArticle", noteArticleSchema);
