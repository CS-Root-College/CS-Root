
import type { Response } from "express";

import type { AuthenticatedRequest } from "../middlewares/auth.middleware";

import apiError from "../utils/apiError";
import apiResponse from "../utils/apiResponse";

import { DailyStats } from "../models/dailyStats.model";
import { calculateStreak } from "../service/streak.service";

const getDashboardOverview = async (
    req: AuthenticatedRequest,
    res: Response
) => {

    // Check authentication
    if (!req.user) {
        throw new apiError(401, "Unauthorized");
    }

    // Get logged-in user's ID
    const userId = req.user._id;

    // Calculate user's streak
    const streak = await calculateStreak(userId);

    // Get user's overall learning statistics
    const stats = await DailyStats.aggregate([
        {
            $match: {
                userId,
            },
        },
        {
            $group: {
                _id: null,

                problemsSolved: {
                    $sum: "$problemsSolved",
                },

                quizzesPassed: {
                    $sum: "$quizzesPassed",
                },

                assessmentsPassed: {
                    $sum: "$assessmentsPassed",
                },

                learningTimeSeconds: {
                    $sum: "$learningTimeSeconds",
                },

                contributionCount: {
                    $sum: "$contributionCount",
                },
            },
        },
    ]);

    const overview = stats[0] || {
        problemsSolved: 0,
        quizzesPassed: 0,
        assessmentsPassed: 0,
        learningTimeSeconds: 0,
        contributionCount: 0,
    };

    return res.status(200).json(
        new apiResponse(200, "Dashboard overview fetched successfully", {
            streak,
            overview,
        })
    );
};

export { getDashboardOverview };
