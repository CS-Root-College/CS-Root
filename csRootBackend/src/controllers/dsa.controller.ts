import type {Request, Response } from "express";
import redis from "../config/redis";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { Problem } from "../models/dsa.model";
import apiError from "../utils/apiError";
import apiResponse from "../utils/apiResponse";
import { hasPremiumAccess } from "../utils/hasPremium";
import { dsaValidation } from "../validation/dsa.validation";
import slugify from "slugify";
import { User } from "../models/user.model";

const createDSAProblem = async (req: AuthenticatedRequest, res: Response) => {
    const createdBy = req.user._id;

    const {
        title,
        problemStatement,
        description,
        difficulty,
        constraints,
        examples,
        testCases,
        hiddenCases,
        tags,
        referenceSolution,
        timeLimit,
        memoryLimit,
        isPremium,
        timeComplaxity,
        spaceComplaxity
    } = req.body;

    dsaValidation.title.parse(title);
    dsaValidation.problemStatement.parse(problemStatement);
    dsaValidation.description.parse(description);
    dsaValidation.difficulty.parse(difficulty);
    dsaValidation.constraints.parse(constraints);
    dsaValidation.examples.parse(examples);
    dsaValidation.testCases.parse(testCases);
    dsaValidation.hiddenCases.parse(hiddenCases);
    dsaValidation.tags.parse(tags);
    dsaValidation.referenceSolution.parse(referenceSolution);
    dsaValidation.timeLimit.parse(timeLimit);
    dsaValidation.memoryLimit.parse(memoryLimit);
    dsaValidation.isPremium.parse(isPremium);

    const createdBeforeTtl = await redis.ttl(
        `created:problem:${createdBy}`
    )

    if (createdBeforeTtl > 0) {
        const minutes = Math.floor(createdBeforeTtl / 60);
        const seconds = createdBeforeTtl % 60;
        throw new apiError(
            429,
            `You can only create one problem within 60 minutes. Try again in ${minutes}m ${seconds}s.`
        );
    }

    const user = await User.findById(createdBy);

    if (!user) {
        throw new apiError(404, "User not found")
    }
    if (!hasPremiumAccess(user)) {
        throw new apiError(403, "Subscription required to create a problem.")
    }

    const existingProblem = await Problem.findOne({
        title
    });

    if (existingProblem) {
        throw new apiError(
            409,
            "A problem with this title already exists."
        );
    }

    const slug = slugify(title, {
        lower: true,
        strict: true,
        trim: true,
    });

    const lastProblem = await Problem
        .findOne()
        .sort({ problemNumber: -1 })
        .select("problemNumber");

    const problemNumber =
        (lastProblem?.problemNumber || 0) + 1;

    const pointsMap = {
        easy: 50,
        medium: 70,
        hard: 100,
    };

    const points = pointsMap[difficulty as keyof typeof pointsMap] + (isPremium ? 10 : 0);

    const isMain = user.role === "admin";

    const problem = await Problem.create({
        problemNumber,

        title,
        slug,
        problemStatement,
        description,
        difficulty,
        points,
        constraints,
        examples,
        testCases,
        hiddenCases,
        tags,
        referenceSolution,
        timeLimit,
        memoryLimit,
        isPremium,
        createdBy,
        isMain,
        timeComplaxity,
        spaceComplaxity
    });

    await redis.set(
        `created:problem:${createdBy}`,
        "yes",
        "EX",
        60 * 60
    );

    return res.status(201).json(
        new apiResponse(
            201,
            "Problem created successfully",
            problem
        )
    );

}

const updateProblem = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user._id;
    const { problemId } = req.params

    const {
        title,
        problemStatement,
        description,
        constraints,
        examples,
        tags,
        timeLimit,
        memoryLimit
    } = req.body;

    if (!problemId) {
        throw new apiError(400, "Problem id is required")
    }

    dsaValidation.title.parse(title);
    dsaValidation.problemStatement.parse(problemStatement);
    dsaValidation.description.parse(description);
    dsaValidation.constraints.parse(constraints);
    dsaValidation.examples.parse(examples);
    dsaValidation.tags.parse(tags);
    dsaValidation.timeLimit.parse(timeLimit);
    dsaValidation.memoryLimit.parse(memoryLimit);

    const existingProblem = await Problem.findOne({
        title,
        _id: { $ne: problemId }
    });

    if (existingProblem) {
        throw new apiError(
            409,
            "A problem with this title already exists"
        );
    }

    const problem = await Problem.findById(problemId)

    if (!problem) {
        throw new apiError(404, "Problem not found")
    }
    if (!problem.createdBy.equals(userId) && req.user.role !== "admin") {
        throw new apiError(403, "You are not the creator. You can't update the problem details.")
    }

    const slug = slugify(title, {
        lower: true,
        strict: true,
        trim: true,
    });

    // Update

    problem.title = title;
    problem.slug = slug;

    problem.problemStatement = problemStatement;
    problem.description = description;

    problem.constraints = constraints;
    problem.examples = examples;

    problem.tags = tags;

    problem.timeLimit = timeLimit;
    problem.memoryLimit = memoryLimit;

    await problem.save()

    return res.status(200).json(
        new apiResponse(200, "Problem updated successfully")
    )

}

const getDSAProblem = async (
    req: Request,
    res: Response
) => {
    const { slug } = req.params;

    if (!slug) {
        throw new apiError(400, "Problem slug is required");
    }

    const problem = await Problem.findOne({
        slug,
        isPublished: true,
    })
        .select(
            "problemNumber title slug problemStatement description difficulty points constraints examples testCases tags timeLimit memoryLimit isPremium isMain timeComplaxity spaceComplaxity totalSubmissions totalAcceptedSubmissions totalSolvedUsers createdAt"
        )
        .populate("createdBy", "name username profilePicture");

    if (!problem) {
        throw new apiError(404, "Problem not found");
    }

    return res.status(200).json(
        new apiResponse(
            200,
            "Problem fetched successfully",
            problem
        )
    );
};

const getAllDSAProblems = async (req: Request, res: Response) => {
    const problems = await Problem.find({
        isPublished: true,
    })
        .select(
            "problemNumber title slug difficulty points tags isPremium totalSubmissions totalAcceptedSubmissions totalSolvedUsers"
        )
        .sort({ problemNumber: 1 });

    const formattedProblems = problems.map((problem) => ({
        ...problem.toObject(),
        acceptanceRate:
            problem.totalSubmissions > 0
                ? Number(
                    (
                        (problem.totalAcceptedSubmissions /
                            problem.totalSubmissions) *
                        100
                    ).toFixed(2)
                )
                : 0,
    }));

    return res.status(200).json(
        new apiResponse(
            200,
            "Problems fetched successfully",
            formattedProblems
        )
    );
};

export {
    createDSAProblem,
    getDSAProblem,
    getAllDSAProblems
}