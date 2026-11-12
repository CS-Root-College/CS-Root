import mongoose, { Schema } from "mongoose";

export interface INoteSubject {
  name: string;
  slug: string;
  displayOrder: number;
}

export interface INoteChapter {
  subject: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  displayOrder: number;
}

export interface INoteTopic {
  chapter: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  displayOrder: number;
}

const noteSubjectSchema = new Schema<INoteSubject>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const noteChapterSchema = new Schema<INoteChapter>(
  {
    subject: {
      type: Schema.Types.ObjectId,
      ref: "NoteSubject",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

noteChapterSchema.index({ subject: 1, slug: 1 }, { unique: true });

const noteTopicSchema = new Schema<INoteTopic>(
  {
    chapter: {
      type: Schema.Types.ObjectId,
      ref: "NoteChapter",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

noteTopicSchema.index({ chapter: 1, slug: 1 }, { unique: true });

const existingNoteSubjectModel =
  mongoose.models.NoteSubject as mongoose.Model<INoteSubject> | undefined;

const existingNoteChapterModel =
  mongoose.models.NoteChapter as mongoose.Model<INoteChapter> | undefined;

const existingNoteTopicModel =
  mongoose.models.NoteTopic as mongoose.Model<INoteTopic> | undefined;

export const NoteSubject =
  existingNoteSubjectModel ??
  mongoose.model<INoteSubject>("NoteSubject", noteSubjectSchema);

export const NoteChapter =
  existingNoteChapterModel ??
  mongoose.model<INoteChapter>("NoteChapter", noteChapterSchema);

export const NoteTopic =
  existingNoteTopicModel ??
  mongoose.model<INoteTopic>("NoteTopic", noteTopicSchema);