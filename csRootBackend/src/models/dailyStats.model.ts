
import mongoose, { Document, Schema } from "mongoose";

export interface IDailyStats extends Document {
    userId: mongoose.Types.ObjectId;

    dateKey: string;
    timezone: string;

    problemsSolved: number;
    quizzesPassed: number;
    assessmentsPassed: number;

    streakActivityCount: number;
    contributionCount: number;

    learningTimeSeconds: number;
}

const dailyStatsSchema = new Schema<IDailyStats>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        dateKey: {
            type: String,
            required: true,
        },

        timezone: {
            type: String,
            required: true,
            default: "Asia/Kolkata",
        },

        problemsSolved: {
            type: Number,
            default: 0,
            min: 0,
        },

        quizzesPassed: {
            type: Number,
            default: 0,
            min: 0,
        },

        assessmentsPassed: {
            type: Number,
            default: 0,
            min: 0,
        },

        streakActivityCount: {
            type: Number,
            default: 0,
            min: 0,
        },

        contributionCount: {
            type: Number,
            default: 0,
            min: 0,
        },

        learningTimeSeconds: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);

// One daily record per user.
dailyStatsSchema.index(
    { userId: 1, dateKey: 1 },
    { unique: true }
);

export const DailyStats = mongoose.model<IDailyStats>(
    "DailyStats",
    dailyStatsSchema
);
