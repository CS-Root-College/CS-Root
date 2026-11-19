import mongoose, { Document, Schema } from "mongoose";

export type Difficulty = "easy" | "medium" | "hard";

export type ProblemType =
    | "coding"
    | "mcq"
    | "theory"
    | "query"
    | "output"
    | "descriptive";

export interface IProblem extends Document {
    title: string;
    slug: string;
    problemStatement: string;
    problemNumber: number;
    description?: string;

    difficulty: Difficulty;
    points: number;

    tags: string[];

    createdBy: mongoose.Types.ObjectId;
    subject: string;

    timeTaken?: number;
    type: ProblemType;

    totalSubmissions: number;
    totalAcceptedSubmissions: number;
    totalSolvedUsers: number;

    avgMarks: number;

    maxMarks: number;
    minMarks: number;
    allottedMarks: number;

    referenceSolution?: string;

    isPublished: boolean;
    isPremium: boolean;
    isMain: boolean;
}

const problemSchema = new Schema<IProblem>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },

        problemStatement: {
            type: String,
            required: true,
            trim: true,
        },

        problemNumber: {
            type: Number,
            required: true,
            unique: true,
        },

        description: {
            type: String,
            trim: true,
        },

        difficulty: {
            type: String,
            enum: ["easy", "medium", "hard"],
            required: true,
        },

        points: {
            type: Number,
            required: true,
            default: 100,
            min: 0,
        },

        tags: {
            type: [String],
            default: [],
        },

        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        subject: {
            type: "String",
            required: true,
        },

        timeTaken: {
            type: Number,
            min: 0,
        },

        type: {
            type: String,
            enum: [
                "coding",
                "mcq",
                "theory",
                "query",
                "output",
                "descriptive",
            ],
            required: true,
            default: "coding",
        },

        totalSubmissions: {
            type: Number,
            default: 0,
            min: 0,
        },

        totalAcceptedSubmissions: {
            type: Number,
            default: 0,
            min: 0,
        },

        totalSolvedUsers: {
            type: Number,
            default: 0,
            min: 0,
        },

        avgMarks: {
            type: Number,
            default: 0,
            min: 0,
        },

        maxMarks: {
            type: Number,
            default: 10,
            min: 1,
        },

        minMarks: {
            type: Number,
            default: 4,
            min: 0,
        },

        allottedMarks: {
            type: Number,
            default: 10,
            min: 0,
        },

        referenceSolution: {
            type: String,
            trim: true,
        },

        isPublished: {
            type: Boolean,
            default: true,
        },

        isPremium: {
            type: Boolean,
            default: false,
        },

        isMain: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

problemSchema.index({ difficulty: 1 });
problemSchema.index({ tags: 1 });
problemSchema.index({ subject: 1 });
problemSchema.index({ subject: 1, difficulty: 1 });
problemSchema.index({ subject: 1, problemNumber: 1 });

export const Subject = mongoose.model<IProblem>(
    "Subject",
    problemSchema
);