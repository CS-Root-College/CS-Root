import { z } from "zod";

export const submissionValidation = {
    code: z
        .string()
        .min(1, "Code cannot be empty")
        .max(50000, "Code is too long"),

    language: z
        .enum(["javascript", "python", "cpp", "java", "c"])
        .refine(
            (lang) => lang !== undefined,
            "Invalid programming language"
        ),
};