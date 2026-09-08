import { z } from "zod";

export const exampleValidation = {
    input: z
        .string({
            message: "Example input is required",
        })
        .trim()
        .min(1, "Example input cannot be empty"),

    output: z
        .string({
            message: "Example output is required",
        })
        .trim()
        .min(1, "Example output cannot be empty"),

    explanation: z
        .string({
            message: "Example explanation must be a string",
        })
        .trim()
        .optional(),
};

export const testCaseValidation = {
    input: z
        .string({
            message: "Test case input is required",
        })
        .trim()
        .min(1, "Test case input cannot be empty"),

    expectedOutput: z
        .string({
            message: "Expected output is required",
        })
        .trim()
        .min(1, "Expected output cannot be empty"),
};

export const dsaValidation = {
    title: z
        .string({
            message: "Title is required",
        })
        .trim()
        .min(3, "Title must be at least 3 characters")
        .max(150, "Title cannot exceed 150 characters"),

    problemStatement: z
        .string({
            message: "Problem statement is required",
        })
        .trim()
        .min(10, "Problem statement must be at least 10 characters"),

    description: z
        .string({
            message: "Description must be a string",
        })
        .trim()
        .optional(),

    difficulty: z.enum(["easy", "medium", "hard"], {
        message: "Difficulty must be easy, medium, or hard",
    }),

    constraints: z
        .array(
            z
                .string({
                    message: "Each constraint must be a string",
                })
                .trim()
                .min(1, "Constraint cannot be empty"),
            {
                message: "Constraints are required",
            }
        )
        .min(1, "At least one constraint is required"),

    examples: z
        .array(
            z.object(exampleValidation),
            {
                message: "Examples are required",
            }
        )
        .min(1, "At least one example is required"),

    testCases: z
        .array(
            z.object(testCaseValidation),
            {
                message: "Visible test cases are required",
            }
        )
        .min(2, "At least 2 visible test cases are required")
        .max(5, "Maximum 5 visible test cases are allowed"),

    hiddenCases: z
        .array(
            z.object(testCaseValidation),
            {
                message: "Hidden test cases are required",
            }
        )
        .min(5, "At least 5 hidden test cases are required")
        .max(20, "Maximum 20 hidden test cases are allowed"),

    tags: z
        .array(
            z
                .string({
                    message: "Each tag must be a string",
                })
                .trim()
                .min(1, "Tag cannot be empty")
        )
        .optional(),

    referenceSolution: z
        .string({
            message: "Reference solution must be a string",
        })
        .trim()
        .optional(),

    timeLimit: z
        .number({
            message: "Time limit is required",
        })
        .int("Time limit must be an integer")
        .min(1, "Time limit must be at least 1 ms")
        .max(10000, "Time limit cannot exceed 10000 ms"),

    memoryLimit: z
        .number({
            message: "Memory limit is required",
        })
        .int("Memory limit must be an integer")
        .min(1, "Memory limit must be at least 1 MB")
        .max(2048, "Memory limit cannot exceed 2048 MB"),

    isPremium: z
        .boolean({
            message: "Premium status must be a boolean",
        })
        .optional(),
};