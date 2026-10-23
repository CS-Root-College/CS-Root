import type { Request, Response } from "express";
import redis from "../config/redis";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { Submission } from "../models/dsaSubmission.model";
import { Problem } from "../models/dsa.model";
import { User } from "../models/user.model";
import apiError from "../utils/apiError";
import apiResponse from "../utils/apiResponse";
import { submissionValidation } from "../validation/dsaSubmission.validation";
import { executeCode } from "../service/judge0.service";
import type { Judge0Response } from "../service/judge0.service";
import mongoose from "mongoose";

const determineSubmissionStatus = (
    judge0Response: Judge0Response,
    testsPassed: number,
    totalTests: number
) => {
    const statusId = judge0Response.status.id;

    if (statusId === 3) {
        return testsPassed === totalTests
            ? { status: "accepted" as const, verdict: true }
            : { status: "wrong_answer" as const, verdict: false };
    }

    if (statusId === 4) {
        return { status: "wrong_answer" as const, verdict: false };
    }

    if (statusId === 5) {
        return { status: "time_limit_exceeded" as const, verdict: false };
    }

    if (statusId === 6) {
        return { status: "compilation_error" as const, verdict: false };
    }

    if (statusId === 7) {
        return { status: "runtime_error" as const, verdict: false };
    }

    if (statusId === 14) {
        return { status: "memory_limit_exceeded" as const, verdict: false };
    }

    return { status: "wrong_answer" as const, verdict: false };
};

const submitCode = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user._id;
    const { problemId } = req.params;
    const { code, language } = req.body;

    if (!problemId) {
        throw new apiError(400, "Problem ID is required");
    }

    submissionValidation.code.parse(code);
    submissionValidation.language.parse(language);

    const problem = await Problem.findById(problemId);
    if (!problem) {
        throw new apiError(404, "Problem not found");
    }

    const existingAcceptedSubmission = await Submission.findOne({
        userId,
        problemId,
        verdict: true,
    });

    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    const rateLimitKey = `submission:${userId}:${problemId}`;
    const submissionTimestamps = await redis.zrangebyscore(
        rateLimitKey,
        oneMinuteAgo,
        now
    );

    if (submissionTimestamps.length >= 5) {
        throw new apiError(
            429,
            "Too many submissions. Try again in a minute."
        );
    }

    await redis.zadd(rateLimitKey, now, `${now}-${Math.random()}`);
    await redis.expire(rateLimitKey, 60);

    let submission = await Submission.create({
        userId,
        problemId: problem.id,
        code,
        language,
        status: "pending",
        verdict: false,
        testsPassed: 0,
        totalTests: problem.testCases.length + problem.hiddenCases.length,
    });

    let testsPassed = 0;
    let failedTestCase: {
        input: string;
        expected: string;
        actual: string;
    } | undefined;
    let executionTime = 0;
    let memoryUsed = 0;
    let finalStatus = "wrong_answer";
    let verdict = false;

    try {
        for (const testCase of problem.testCases) {
            const judge0Response = await executeCode({
                language,
                code,
                stdin: testCase.input,
            });

            executionTime = Math.max(
                executionTime,
                parseFloat(judge0Response.time || "0") * 1000
            );
            memoryUsed = Math.max(
                memoryUsed,
                judge0Response.memory || 0
            );

            if (
                judge0Response.status.id === 6 ||
                judge0Response.status.id === 7
            ) {
                const { status, verdict: v } = determineSubmissionStatus(
                    judge0Response,
                    testsPassed,
                    problem.testCases.length
                );
                finalStatus = status;
                verdict = v;

                failedTestCase = {
                    input: testCase.input,
                    expected: testCase.expectedOutput,
                    actual:
                        judge0Response.stderr ||
                        judge0Response.compile_output ||
                        "No output",
                };

                break;
            }

            const expectedOutput = testCase.expectedOutput.trim();
            const actualOutput = (judge0Response.stdout || "").trim();

            if (expectedOutput === actualOutput) {
                testsPassed++;
            } else {
                const { status, verdict: v } = determineSubmissionStatus(
                    judge0Response,
                    testsPassed,
                    problem.testCases.length
                );
                finalStatus = status;
                verdict = v;

                failedTestCase = {
                    input: testCase.input,
                    expected: expectedOutput,
                    actual: actualOutput,
                };

                break;
            }
        }

        if (testsPassed === problem.testCases.length) {
            for (const hiddenCase of problem.hiddenCases) {
                const judge0Response = await executeCode({
                    language,
                    code,
                    stdin: hiddenCase.input,
                });

                executionTime = Math.max(
                    executionTime,
                    parseFloat(judge0Response.time || "0") * 1000
                );
                memoryUsed = Math.max(
                    memoryUsed,
                    judge0Response.memory || 0
                );

                if (
                    judge0Response.status.id === 6 ||
                    judge0Response.status.id === 7
                ) {
                    const { status, verdict: v } = determineSubmissionStatus(
                        judge0Response,
                        testsPassed,
                        problem.testCases.length + problem.hiddenCases.length
                    );
                    finalStatus = status;
                    verdict = v;

                    break;
                }

                const expectedOutput = hiddenCase.expectedOutput.trim();
                const actualOutput = (judge0Response.stdout || "").trim();

                if (expectedOutput === actualOutput) {
                    testsPassed++;
                } else {
                    const { status, verdict: v } = determineSubmissionStatus(
                        judge0Response,
                        testsPassed,
                        problem.testCases.length + problem.hiddenCases.length
                    );
                    finalStatus = status;
                    verdict = v;

                    break;
                }
            }

            if (
                testsPassed ===
                problem.testCases.length + problem.hiddenCases.length
            ) {
                finalStatus = "accepted";
                verdict = true;
            }
        }
    } catch (error) {
        console.error("Code execution error:", error);
        finalStatus = "runtime_error";
        verdict = false;
    }

    submission.status = finalStatus as any;
    submission.verdict = verdict;
    submission.executionTime = executionTime;
    submission.memoryUsed = memoryUsed;
    submission.testsPassed = testsPassed;
    submission.totalTests =
        problem.testCases.length + problem.hiddenCases.length;

    if (failedTestCase) {
        submission.failedTestCase = failedTestCase;
    }

    if (verdict) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            await submission.save({ session });

            problem.totalSubmissions += 1;
            problem.totalAcceptedSubmissions += 1;

            const previousAccepted = await Submission.findOne({
                userId,
                problemId,
                verdict: true,
                _id: { $ne: submission._id },
            }).session(session);

            let isFirstAC = false;

            if (!previousAccepted) {
                problem.totalSolvedUsers += 1;
                isFirstAC = true;

                const pointsToAdd = problem.points;
                const xpToAdd = Math.round(pointsToAdd * 1.1);

                await User.findByIdAndUpdate(
                    userId,
                    {
                        $inc: {
                            totalPoints: pointsToAdd,
                            experiencePoints: xpToAdd,
                        },
                        lastSolvedDate: new Date(),
                    },
                    { session }
                );
            }

            await problem.save({ session });
            await session.commitTransaction();
        } catch (txError) {
            await session.abortTransaction();
            throw txError;
        } finally {
            session.endSession();
        }
    } else {
        await submission.save();
        problem.totalSubmissions += 1;
        await problem.save();
    }

    return res.status(201).json(
        new apiResponse(201, "Code submitted successfully", {
            submissionId: submission._id,
            status: submission.status,
            verdict: submission.verdict,
            testsPassed: submission.testsPassed,
            totalTests: submission.totalTests,
            executionTime: submission.executionTime,
            memoryUsed: submission.memoryUsed,
            failedTestCase: submission.failedTestCase,
            pointsAwarded: verdict && !existingAcceptedSubmission ? problem.points : 0,
            xpAwarded: verdict && !existingAcceptedSubmission ? Math.round(problem.points * 1.1) : 0,
        })
    );
};

const getSubmissions = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user._id;
    const { problemId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!problemId) {
        throw new apiError(400, "Problem ID is required");
    }

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    const submissions = await Submission.find({
        userId,
        problemId,
    })
        .select(
            "language status verdict executionTime memoryUsed testsPassed totalTests createdAt"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

    const total = await Submission.countDocuments({
        userId,
        problemId,
    });

    return res.status(200).json(
        new apiResponse(200, "Submissions fetched successfully", {
            submissions,
            pagination: {
                current: pageNum,
                total: Math.ceil(total / limitNum),
                count: submissions.length,
            },
        })
    );
};

const getSubmissionDetails = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    const userId = req.user._id;
    const { submissionId } = req.params;

    if (!submissionId) {
        throw new apiError(400, "Submission ID is required");
    }

    const submission = await Submission.findById(submissionId)
        .populate("problemId", "title slug difficulty points")
        .populate("userId", "name username");

    if (!submission) {
        throw new apiError(404, "Submission not found");
    }

    if (
        !submission.userId._id.equals(userId) &&
        req.user.role !== "admin"
    ) {
        throw new apiError(403, "You can't view this submission");
    }

    return res.status(200).json(
        new apiResponse(
            200,
            "Submission details fetched successfully",
            submission
        )
    );
};

const getUserStats = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user._id;

    const stats = await Submission.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(userId as string),
                verdict: true,
            },
        },
        {
            $group: {
                _id: null,
                totalAccepted: { $sum: 1 },
                avgTime: { $avg: "$executionTime" },
                avgMemory: { $avg: "$memoryUsed" },
            },
        },
    ]);

    const problemStats = await Submission.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(userId as string),
            },
        },
        {
            $group: {
                _id: "$problemId",
                attempts: { $sum: 1 },
                accepted: {
                    $sum: { $cond: ["$verdict", 1, 0] },
                },
                bestTime: { $min: "$executionTime" },
                bestMemory: { $min: "$memoryUsed" },
            },
        },
        {
            $lookup: {
                from: "problems",
                localField: "_id",
                foreignField: "_id",
                as: "problem",
            },
        },
        {
            $unwind: "$problem",
        },
        {
            $project: {
                problem: "$problem",
                attempts: 1,
                accepted: 1,
                bestTime: 1,
                bestMemory: 1,
            },
        },
    ]);

    return res.status(200).json(
        new apiResponse(200, "User stats fetched successfully", {
            overall: stats[0] || {
                totalAccepted: 0,
                avgTime: 0,
                avgMemory: 0,
            },
            byProblem: problemStats,
        })
    );
};

const getAcceptedSubmissions = async (
    req: Request,
    res: Response
) => {
    const { problemId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    if (!problemId) {
        throw new apiError(400, "Problem ID is required");
    }

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;
    const skip = (pageNum - 1) * limitNum;

    const submissions = await Submission.find({
        problemId,
        verdict: true,
    })
        .select(
            "userId executionTime memoryUsed createdAt"
        )
        .populate("userId", "name username profilePicture")
        .sort({ executionTime: 1 })
        .skip(skip)
        .limit(limitNum);

    const total = await Submission.countDocuments({
        problemId,
        verdict: true,
    });

    return res.status(200).json(
        new apiResponse(
            200,
            "Accepted submissions fetched successfully",
            {
                submissions,
                pagination: {
                    current: pageNum,
                    total: Math.ceil(total / limitNum),
                },
            }
        )
    );
};

export {
    submitCode,
    getSubmissions,
    getSubmissionDetails,
    getUserStats,
    getAcceptedSubmissions,
};