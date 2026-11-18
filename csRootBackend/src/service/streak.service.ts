
import mongoose from "mongoose";
import { Activity } from "../models/activity.model";

interface StreakResult {
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: string | null;
}

export const calculateStreak = async (
    userId: mongoose.Types.ObjectId,
    timezone = "Asia/Kolkata"
): Promise<StreakResult> => {

    const activities = await Activity.aggregate([
        {
            $match: {
                userId,
                countsForStreak: true,
            },
        },
        {
            $project: {
                date: {
                    $dateToString: {
                        format: "%Y-%m-%d",
                        date: "$createdAt",
                        timezone,
                    },
                },
            },
        },
        {
            $group: {
                _id: "$date",
            },
        },
        {
            $sort: {
                _id: -1,
            },
        },
    ]);

    const dates: string[] = activities.map(
        (activity) => activity._id
    );

    if (dates.length === 0) {
        return {
            currentStreak: 0,
            longestStreak: 0,
            lastActivityDate: null,
        };
    }

    const today = new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date());

    const toDayNumber = (date: string): number => {
        const [year, month, day] = date.split("-").map(Number);

        if (year === undefined || month === undefined || day === undefined) {
            throw new Error("Invalid date format");
        }

        return Math.floor(
            Date.UTC(year, month - 1, day) / 86400000
        );
    };

    // Most recent activity date
    const latestActivityDate = dates[0]!;

    // Calculate longest streak
    let longestStreak = 1;
    let currentCount = 1;

    for (let i = 1; i < dates.length; i++) {
        const difference =
            toDayNumber(dates[i - 1]!) -
            toDayNumber(dates[i]!);

        if (difference === 1) {
            currentCount++;

            longestStreak = Math.max(
                longestStreak,
                currentCount
            );
        } else {
            currentCount = 1;
        }
    }

    // Calculate current streak
    const differenceFromToday =
        toDayNumber(today) -
        toDayNumber(latestActivityDate);

    let currentStreak = 0;

    if (differenceFromToday === 0 || differenceFromToday === 1) {
        currentStreak = 1;

        for (let i = 1; i < dates.length; i++) {
            const difference =
                toDayNumber(dates[i - 1]!) -
                toDayNumber(dates[i]!);

            if (difference === 1) {
                currentStreak++;
            } else {
                break;
            }
        }
    }

    return {
        currentStreak,
        longestStreak,
        lastActivityDate: latestActivityDate,
    };
};
