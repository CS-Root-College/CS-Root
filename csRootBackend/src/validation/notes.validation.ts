
import { z } from "zod";

// Subject validation
export const createNoteSubjectValidation = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Subject name must contain at least 2 characters.")
    .max(100, "Subject name cannot exceed 100 characters."),

  displayOrder: z.number().int().min(0).default(0),
});

// Chapter validation
export const createNoteChapterValidation = z.object({
  subjectId: z.string().trim().min(1, "Subject ID is required."),

  name: z
    .string()
    .trim()
    .min(2, "Chapter name must contain at least 2 characters.")
    .max(100, "Chapter name cannot exceed 100 characters."),

  displayOrder: z.number().int().min(0).default(0),
});

// Topic validation
export const createNoteTopicValidation = z.object({
  chapterId: z.string().trim().min(1, "Chapter ID is required."),

  name: z
    .string()
    .trim()
    .min(2, "Topic name must contain at least 2 characters.")
    .max(150, "Topic name cannot exceed 150 characters."),

  displayOrder: z.number().int().min(0).default(0),
});

// Article content block validation
const headingBlock = z.object({
  type: z.literal("heading"),
  content: z.string().trim().min(1),
});

const paragraphBlock = z.object({
  type: z.literal("paragraph"),
  content: z.string().trim().min(1),
});

const imageBlock = z.object({
  type: z.literal("image"),
  url: z.string().url("Invalid image URL."),
  caption: z.string().max(500).optional(),
});

const listBlock = z.object({
  type: z.literal("list"),
  items: z.array(z.string().trim().min(1)).min(1),
});

const codeBlock = z.object({
  type: z.literal("code"),
  content: z.string().min(1),
  language: z.string().optional(),
});

const quoteBlock = z.object({
  type: z.literal("quote"),
  content: z.string().trim().min(1),
});

// Article validation
export const createNoteArticleValidation = z.object({
  topicId: z.string().trim().min(1, "Topic ID is required."),

  title: z
    .string()
    .trim()
    .min(3, "Article title must contain at least 3 characters.")
    .max(200, "Article title cannot exceed 200 characters."),

  content: z
    .array(
      z.discriminatedUnion("type", [
        headingBlock,
        paragraphBlock,
        imageBlock,
        listBlock,
        codeBlock,
        quoteBlock,
      ])
    )
    .min(1, "Article must contain at least one content block."),
});
// Update article validation
export const updateNoteArticleValidation = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Article title must contain at least 3 characters.")
    .max(200, "Article title cannot exceed 200 characters."),

  content: z
    .array(
      z.discriminatedUnion("type", [
        headingBlock,
        paragraphBlock,
        imageBlock,
        listBlock,
        codeBlock,
        quoteBlock,
      ])
    )
    .min(1, "Article must contain at least one content block."),
});