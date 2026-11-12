
import { z } from "zod";

export const resourceValidation = z.object({
    title: z
        .string()
        .trim()
        .min(5, "Title must contain at least 5 characters.")
        .max(200, "Title cannot exceed 200 characters."),

    description: z
        .string()
        .trim()
        .max(500, "Description cannot exceed 500 characters.")
        .default(""),

    subject: z
        .string()
        .trim()
        .min(2, "Subject must contain at least 2 characters."),

    tags: z
        .array(
            z.string()
                .trim()
                .min(1, "Tags cannot be empty.")
                .max(30, "A tag cannot exceed 30 characters.")
        )
        .max(10, "You can add a maximum of 10 tags.")
        .default([]),

    content: z
        .record(z.string(), z.any())
        .refine((value) => value.type === "doc", {
            message: "Invalid Tiptap document.",
        }),

    assets: z
        .array(
            z.object({
                publicId: z.string().trim().min(1),
                secureUrl: z.string().url(),
                purpose: z.enum(["content", "cover"]).default("content"),
                format: z.string().optional(),
                bytes: z.number().min(0).optional(),
                width: z.number().min(0).optional(),
                height: z.number().min(0).optional(),
                altText: z.string().trim().max(300).default(""),
                caption: z.string().trim().max(500).default(""),
            })
        )
        .default([]),

    seo: z
        .object({
            title: z
                .string()
                .trim()
                .max(200)
                .default(""),

            description: z
                .string()
                .trim()
                .max(500)
                .default(""),
        })
        .default({
            title: "",
            description: "",
        }),
});
