
import mongoose, { Schema } from "mongoose";
import type { Model, Types } from "mongoose";

export interface INoteChapter {
  subject: Types.ObjectId;
  name: string;
  slug: string;
  displayOrder: number;
  isPublished: boolean;
}

const noteChapterSchema = new Schema<INoteChapter>(
  {
    subject: {
      type: Schema.Types.ObjectId,
      ref: "NoteSubject",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

noteChapterSchema.index(
  { subject: 1, slug: 1 },
  { unique: true }
);

noteChapterSchema.index({ subject: 1, displayOrder: 1 });

export const NoteChapter: Model<INoteChapter> =
  (mongoose.models.NoteChapter as Model<INoteChapter>) ||
  mongoose.model<INoteChapter>("NoteChapter", noteChapterSchema);
