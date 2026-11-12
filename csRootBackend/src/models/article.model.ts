import mongoose, { Schema } from "mongoose";

export type ArticleStatus = "draft" | "published";

export type ArticleBlockType =
  | "heading"
  | "paragraph"
  | "image"
  | "list"
  | "code"
  | "quote";

export interface IArticleBlock {
  type: ArticleBlockType;
  text?: string;
  level?: number;
  src?: string;
  alt?: string;
  caption?: string;
  items?: string[];
  language?: string;
}

export interface IArticle {
  topic: mongoose.Types.ObjectId;
  title: string;
  content: IArticleBlock[];
  status: ArticleStatus;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
}

const articleBlockSchema = new Schema<IArticleBlock>(
  {
    type: {
      type: String,
      enum: ["heading", "paragraph", "image", "list", "code", "quote"],
      required: true,
    },
    text: String,
    level: {
      type: Number,
      min: 2,
      max: 4,
    },
    src: String,
    alt: String,
    caption: String,
    items: {
      type: [String],
      default: undefined,
    },
    language: String,
  },
  { _id: false }
);

const articleSchema = new Schema<IArticle>(
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
      maxlength: 180,
    },
    content: {
      type: [articleBlockSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const existingArticleModel =
  mongoose.models.Article as mongoose.Model<IArticle> | undefined;

export const Article =
  existingArticleModel ??
  mongoose.model<IArticle>("Article", articleSchema);