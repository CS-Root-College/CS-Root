
import mongoose from "mongoose";
import { Activity } from "../models/activity.model";
import type { ActivityType } from "../models/activity.model";
import { DailyStats } from "../models/dailyStats.model";

interface RecordActivityParams {
    userId: mongoose.Types.ObjectId;
    activityType: ActivityType;
    referenceId?: mongoose.Types.ObjectId;
    eventKey: string;
    countsForStreak: boolean;
    countsForContribution: boolean;
    session: mongoose.ClientSession;
    timezone?: string;
}

const getDateKey = (timezone: string): string => {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(new Date());

    const year = parts.find((part) => part.type === "year")?.value;
    const month = parts.find((part) => part.type === "month")?.value;
    const day = parts.find((part) => part.type === "day")?.value;

    return `${year}-${month}-${day}`;
};

export const recordActivity = async ({
    userId,
    activityType,
    referenceId,
    eventKey,
    countsForStreak,
    countsForContribution,
    session,
    timezone = "Asia/Kolkata",
}: RecordActivityParams) => {
    const dateKey = getDateKey(timezone);

    const activityData = {
        userId,
        activityType,
        ...(referenceId && { referenceId }),
        eventKey,
        countsForStreak,
        countsForContribution,
    };

    // Save activity inside the existing transaction.
    const [activity] = await Activity.create(
        [activityData],
        { session }
    );

    const statsUpdate: Record<string, number> = {};

    if (activityType === "problem_solved") {
        statsUpdate.problemsSolved = 1;
    }

    if (activityType === "quiz_passed") {
        statsUpdate.quizzesPassed = 1;
    }

    if (activityType === "assessment_passed") {
        statsUpdate.assessmentsPassed = 1;
    }

    if (countsForStreak) {
        statsUpdate.streakActivityCount = 1;
    }

    if (countsForContribution) {
        statsUpdate.contributionCount = 1;
    }

    // Update daily statistics in the same transaction.
    await DailyStats.updateOne(
        { userId, dateKey },
        {
            $setOnInsert: { timezone },
            $inc: statsUpdate,
        },
        {
            upsert: true,
            session,
        }
    );

    return activity;
};
