
import mongoose, { Document, Schema } from "mongoose";

export type ActivityType =
    | "problem_solved"
    | "quiz_passed"
    | "assessment_passed"
    | "topic_completed";

export interface IActivity extends Document {
    userId: mongoose.Types.ObjectId;
    activityType: ActivityType;
    referenceId?: mongoose.Types.ObjectId;
    eventKey: string;
    countsForStreak: boolean;
    countsForContribution: boolean;
    createdAt: Date;
}

const activitySchema = new Schema<IActivity>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        activityType: {
            type: String,
            enum: [
                "problem_solved",
                "quiz_passed",
                "assessment_passed",
                "topic_completed",
            ],
            required: true,
        },

        referenceId: {
            type: Schema.Types.ObjectId,
        },

        eventKey: {
            type: String,
            required: true,
        },

        countsForStreak: {
            type: Boolean,
            default: false,
        },

        countsForContribution: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent duplicate activities for the same user and event.
activitySchema.index(
    { userId: 1, eventKey: 1 },
    { unique: true }
);

// Retrieve a user's activities by date.
activitySchema.index({ userId: 1, createdAt: -1 });

export const Activity = mongoose.model<IActivity>(
    "Activity",
    activitySchema
);
