
import mongoose, { Schema } from "mongoose";
import type { Model, Types } from "mongoose";

export interface INoteTopic {
  chapter: Types.ObjectId;
  name: string;
  slug: string;
  displayOrder: number;
  isPublished: boolean;
}

const noteTopicSchema = new Schema<INoteTopic>(
  {
    chapter: {
      type: Schema.Types.ObjectId,
      ref: "NoteChapter",
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

noteTopicSchema.index(
  { chapter: 1, slug: 1 },
  { unique: true }
);

noteTopicSchema.index({ chapter: 1, displayOrder: 1 });

export const NoteTopic: Model<INoteTopic> =
  (mongoose.models.NoteTopic as Model<INoteTopic>) ||
  mongoose.model<INoteTopic>("NoteTopic", noteTopicSchema);
