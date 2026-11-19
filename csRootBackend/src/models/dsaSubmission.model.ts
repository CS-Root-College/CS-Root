import mongoose, { Document, Schema } from "mongoose";

export type SubmissionStatus = "pending" | "accepted" | "wrong_answer" | "time_limit_exceeded" | "memory_limit_exceeded" | "compilation_error" | "runtime_error";

export interface ISubmission extends Document {
    userId: mongoose.Types.ObjectId;
    problemId: mongoose.Types.ObjectId;

    code: string;
    language: "javascript" | "python" | "cpp" | "java" | "c";

    status: SubmissionStatus;
    verdict: boolean;

    executionTime: number; 
    memoryUsed: number;

    testsPassed: number;
    totalTests: number;
    failedTestCase?: {
        input: string;
        expected: string;
        actual: string;
    };

    submittedAt: Date;
    updatedAt: Date;
}

const submissionSchema = new Schema<ISubmission>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        problemId: {
            type: Schema.Types.ObjectId,
            ref: "Problem",
            required: true,
            index: true,
        },

        code: {
            type: String,
            required: true,
        },

        language: {
            type: String,
            enum: ["javascript", "c", "python", "cpp", "java"],
            required: true,
        },

        status: {
            type: String,
            enum: ["pending", "accepted", "wrong_answer", "time_limit_exceeded", "memory_limit_exceeded", "compilation_error", "runtime_error"],
            default: "pending",
        },

        verdict: {
            type: Boolean,
            default: false,
        },

        executionTime: {
            type: Number,
            default: 0,
        },

        memoryUsed: {
            type: Number,
            default: 0,
        },

        testsPassed: {
            type: Number,
            default: 0,
        },

        totalTests: {
            type: Number,
            default: 0,
        },

        failedTestCase: {
            input: String,
            expected: String,
            actual: String,
            _id: false,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for quick lookups
submissionSchema.index({ userId: 1, problemId: 1 });
submissionSchema.index({ userId: 1, createdAt: -1 });
submissionSchema.index({ problemId: 1, verdict: 1 });

export const Submission = mongoose.model<ISubmission>(
    "Submission",
    submissionSchema
);