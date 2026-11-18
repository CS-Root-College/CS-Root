
import mongoose, { Schema } from "mongoose";
import type { Model } from "mongoose";

export interface INoteSubject {
  name: string;
  slug: string;
  displayOrder: number;
  isPublished: boolean;
}

const noteSubjectSchema = new Schema<INoteSubject>(
  {
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
      unique: true,
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

noteSubjectSchema.index({ displayOrder: 1 });

export const NoteSubject: Model<INoteSubject> =
  (mongoose.models.NoteSubject as Model<INoteSubject>) ||
  mongoose.model<INoteSubject>("NoteSubject", noteSubjectSchema);
