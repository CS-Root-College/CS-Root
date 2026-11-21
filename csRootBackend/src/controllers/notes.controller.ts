import type { Request, Response } from "express";
import mongoose from "mongoose";
import slugify from "slugify";

import { NoteSubject } from "../models/noteSubject.model";
import { NoteChapter } from "../models/noteChapter.model";
import { NoteTopic } from "../models/noteTopic.model";
import type { INoteContentBlock } from "../models/noteArticle.model";
import { NoteArticle } from "../models/noteArticle.model";

import type { AuthenticatedRequest } from "../middlewares/auth.middleware";

import apiError from "../utils/apiError";
import apiResponse from "../utils/apiResponse";

import {
  createNoteSubjectValidation,
  createNoteChapterValidation,
  createNoteTopicValidation,
  createNoteArticleValidation,
  updateNoteArticleValidation,
} from "../validation/notes.validation";
// Helpers
const isDuplicateKeyError = (error: unknown): boolean => {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
};

const createSlug = (name: string): string => {
  return slugify(name, {
    lower: true,
    strict: true,
    trim: true,
  });
};

// PUBLIC NOTES APIs

// GET /api/v1/notes/subjects
const getNoteSubjects = async (_req: Request, res: Response) => {
  const subjects = await NoteSubject.find({ isPublished: true })
    .sort({ displayOrder: 1, name: 1 })
    .lean();

  return res
    .status(200)
    .json(new apiResponse(200, "Subjects fetched successfully.", subjects));
};

// GET /api/v1/notes/subjects/:subjectId/chapters
const getNoteChapters = async (req: Request, res: Response) => {
  const { subjectId } = req.params;

  if (!mongoose.isValidObjectId(subjectId)) {
    throw new apiError(400, "Invalid subject ID.");
  }

  const subject = await NoteSubject.findOne({
    _id: subjectId,
    isPublished: true,
  });

  if (!subject) {
    throw new apiError(404, "Subject not found.");
  }

  const chapters = await NoteChapter.find()
    .where("subject")
    .equals(subjectId)
    .where("isPublished")
    .equals(true)
    .sort({ displayOrder: 1, name: 1 })
    .lean();

  return res
    .status(200)
    .json(new apiResponse(200, "Chapters fetched successfully.", chapters));
};

// GET /api/v1/notes/chapters/:chapterId/topics
const getNoteTopics = async (req: Request, res: Response) => {
  const { chapterId } = req.params;

  if (!mongoose.isValidObjectId(chapterId)) {
    throw new apiError(400, "Invalid chapter ID.");
  }

  const chapter = await NoteChapter.findOne({
    _id: chapterId,
    isPublished: true,
  });

  if (!chapter) {
    throw new apiError(404, "Chapter not found.");
  }

  const subject = await NoteSubject.findOne({
    _id: chapter.subject,
    isPublished: true,
  });

  if (!subject) {
    throw new apiError(404, "Subject not found.");
  }

  const topics = await NoteTopic.find()
    .where("chapter")
    .equals(chapterId)
    .where("isPublished")
    .equals(true)
    .sort({ displayOrder: 1, name: 1 })
    .lean();

  return res
    .status(200)
    .json(new apiResponse(200, "Topics fetched successfully.", topics));
};

// GET /api/v1/notes/topics/:topicId
const getNoteArticle = async (req: Request, res: Response) => {
  const { topicId } = req.params;

  if (!mongoose.isValidObjectId(topicId)) {
    throw new apiError(400, "Invalid topic ID.");
  }

  const topic = await NoteTopic.findOne({
    _id: topicId,
    isPublished: true,
  });

  if (!topic) {
    throw new apiError(404, "Topic not found.");
  }

  const chapter = await NoteChapter.findOne({
    _id: topic.chapter,
    isPublished: true,
  });

  if (!chapter) {
    throw new apiError(404, "Chapter not found.");
  }

  const subject = await NoteSubject.findOne({
    _id: chapter.subject,
    isPublished: true,
  });

  if (!subject) {
    throw new apiError(404, "Subject not found.");
  }

  const article = await NoteArticle.findOne()
    .where("topic")
    .equals(topicId)
    .where("status")
    .equals("published")
    .lean();

  if (!article) {
    throw new apiError(404, "Published notes not found.");
  }

  return res
    .status(200)
    .json(new apiResponse(200, "Notes fetched successfully.", article));
};

// ADMIN NOTES APIs
// All these functions require verifyJWT + adminOnly

// POST /api/v1/notes/admin/subjects
const createNoteSubject = async (req: AuthenticatedRequest, res: Response) => {
  const { name, displayOrder } = createNoteSubjectValidation.parse(req.body);

  const slug = createSlug(name);

  if (!slug) {
    throw new apiError(400, "Unable to generate subject slug.");
  }

  try {
    const subject = await NoteSubject.create({
      name,
      slug,
      displayOrder,
      isPublished: false,
    });

    return res
      .status(201)
      .json(new apiResponse(201, "Subject created as draft.", subject));
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new apiError(409, "This subject already exists.");
    }
    throw error;
  }
};

// POST /api/v1/notes/admin/chapters
const createNoteChapter = async (req: AuthenticatedRequest, res: Response) => {
  const { subjectId, name, displayOrder } = createNoteChapterValidation.parse(
    req.body,
  );

  if (!mongoose.isValidObjectId(subjectId)) {
    throw new apiError(400, "Invalid subject ID.");
  }

  const subject = await NoteSubject.findById(subjectId);

  if (!subject) {
    throw new apiError(404, "Subject not found.");
  }

  const slug = createSlug(name);

  if (!slug) {
    throw new apiError(400, "Unable to generate chapter slug.");
  }

  try {
    const chapter = await NoteChapter.create({
      subject: subjectId,
      name,
      slug,
      displayOrder,
      isPublished: false,
    });

    return res
      .status(201)
      .json(new apiResponse(201, "Chapter created as draft.", chapter));
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new apiError(
        409,
        "A chapter with this name already exists in this subject.",
      );
    }
    throw error;
  }
};

// POST /api/v1/notes/admin/topics
const createNoteTopic = async (req: AuthenticatedRequest, res: Response) => {
  const { chapterId, name, displayOrder } = createNoteTopicValidation.parse(
    req.body,
  );

  if (!mongoose.isValidObjectId(chapterId)) {
    throw new apiError(400, "Invalid chapter ID.");
  }

  const chapter = await NoteChapter.findById(chapterId);

  if (!chapter) {
    throw new apiError(404, "Chapter not found.");
  }

  const slug = createSlug(name);

  if (!slug) {
    throw new apiError(400, "Unable to generate topic slug.");
  }

  try {
    const topic = await NoteTopic.create({
      chapter: chapterId,
      name,
      slug,
      displayOrder,
      isPublished: false,
    });

    return res
      .status(201)
      .json(new apiResponse(201, "Topic created as draft.", topic));
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new apiError(
        409,
        "A topic with this name already exists in this chapter.",
      );
    }
    throw error;
  }
};

// POST /api/v1/notes/admin/articles
const createNoteArticle = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user._id;

  const {
    topicId,
    title,
    content: validatedContent,
  } = createNoteArticleValidation.parse(req.body);

  const content: INoteContentBlock[] = validatedContent.map((block) => {
    switch (block.type) {
      case "heading":
      case "paragraph":
      case "code":
      case "quote":
        return {
          type: block.type,
          content: block.content,
          ...(block.type === "code" && block.language !== undefined
            ? { language: block.language }
            : {}),
        };

      case "image":
        return {
          type: "image",
          url: block.url,
          ...(block.caption !== undefined ? { caption: block.caption } : {}),
        };

      case "list":
        return {
          type: "list",
          items: block.items,
        };
    }
  });

  if (!mongoose.isValidObjectId(topicId)) {
    throw new apiError(400, "Invalid topic ID.");
  }

  const userExists = await mongoose.model("User").exists({
    _id: userId,
  });

  if (!userExists) {
    throw new apiError(404, "Admin user not found.");
  }

  const topic = await NoteTopic.findById(topicId);

  if (!topic) {
    throw new apiError(404, "Topic not found.");
  }

  try {
    const article = await NoteArticle.create({
      topic: topicId,
      title,
      content,
      createdBy: userId,
      status: "draft",
      publishedAt: null,
    });

    return res
      .status(201)
      .json(new apiResponse(201, "Article created as draft.", article));
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new apiError(409, "An article already exists for this topic.");
    }
    throw error;
  }
};

// PUT /api/v1/notes/admin/articles/:articleId
const updateNoteArticle = async (req: AuthenticatedRequest, res: Response) => {
  const { articleId } = req.params;

  if (!mongoose.isValidObjectId(articleId)) {
    throw new apiError(400, "Invalid article ID.");
  }

  const { title, content: validatedContent } =
    updateNoteArticleValidation.parse(req.body);

  const content: INoteContentBlock[] = validatedContent.map((block) => {
    switch (block.type) {
      case "heading":
      case "paragraph":
      case "code":
      case "quote":
        return {
          type: block.type,
          content: block.content,
          ...(block.type === "code" && block.language !== undefined
            ? { language: block.language }
            : {}),
        };

      case "image":
        return {
          type: "image",
          url: block.url,
          ...(block.caption !== undefined ? { caption: block.caption } : {}),
        };

      case "list":
        return {
          type: "list",
          items: block.items,
        };
    }
  });

  const article = await NoteArticle.findById(articleId);

  if (!article) {
    throw new apiError(404, "Article not found.");
  }

  article.title = title;
  article.content = content;
  article.updatedBy = req.user._id;

  await article.save();

  return res
    .status(200)
    .json(new apiResponse(200, "Article updated successfully.", article));
};

// ADMIN NOTES LISTING APIs

// GET /api/v1/notes/admin/subjects
const getAdminNoteSubjects = async (_req: Request, res: Response) => {
  const subjects = await NoteSubject.find()
    .sort({ displayOrder: 1, name: 1 })
    .lean();

  return res
    .status(200)
    .json(
      new apiResponse(200, "Admin subjects fetched successfully.", subjects),
    );
};

// GET /api/v1/notes/admin/subjects/:subjectId/chapters
const getAdminNoteChapters = async (req: Request, res: Response) => {
  const { subjectId } = req.params;

  if (!mongoose.isValidObjectId(subjectId)) {
    throw new apiError(400, "Invalid subject ID.");
  }

  const chapters = await NoteChapter.find()
    .where("subject")
    .equals(subjectId)
    .sort({ displayOrder: 1, name: 1 })
    .lean();

  return res
    .status(200)
    .json(
      new apiResponse(200, "Admin chapters fetched successfully.", chapters),
    );
};

// GET /api/v1/notes/admin/chapters/:chapterId/topics
const getAdminNoteTopics = async (req: Request, res: Response) => {
  const { chapterId } = req.params;

  if (!mongoose.isValidObjectId(chapterId)) {
    throw new apiError(400, "Invalid chapter ID.");
  }

  const topics = await NoteTopic.find()
    .where("chapter")
    .equals(chapterId)
    .sort({ displayOrder: 1, name: 1 })
    .lean();
  return res
    .status(200)
    .json(new apiResponse(200, "Admin topics fetched successfully.", topics));
};

// GET /api/v1/notes/admin/topics/:topicId/article
const getAdminNoteArticle = async (req: Request, res: Response) => {
  const { topicId } = req.params;

  if (!mongoose.isValidObjectId(topicId)) {
    throw new apiError(400, "Invalid topic ID.");
  }

  const article = await NoteArticle.findOne()
    .where("topic")
    .equals(topicId)
    .lean();

  return res
    .status(200)
    .json(new apiResponse(200, "Admin article fetched successfully.", article));
};

// ADMIN PUBLISH APIs

// PATCH /api/v1/notes/admin/subjects/:subjectId/publish
const publishNoteSubject = async (req: AuthenticatedRequest, res: Response) => {
  const { subjectId } = req.params;

  if (!mongoose.isValidObjectId(subjectId)) {
    throw new apiError(400, "Invalid subject ID.");
  }

  const subject = await NoteSubject.findByIdAndUpdate(
    subjectId,
    { $set: { isPublished: true } },
    { new: true, runValidators: true },
  );

  if (!subject) {
    throw new apiError(404, "Subject not found.");
  }

  return res
    .status(200)
    .json(new apiResponse(200, "Subject published successfully.", subject));
};

// PATCH /api/v1/notes/admin/chapters/:chapterId/publish
const publishNoteChapter = async (req: AuthenticatedRequest, res: Response) => {
  const { chapterId } = req.params;

  if (!mongoose.isValidObjectId(chapterId)) {
    throw new apiError(400, "Invalid chapter ID.");
  }

  const chapter = await NoteChapter.findById(chapterId);

  if (!chapter) {
    throw new apiError(404, "Chapter not found.");
  }

  const subject = await NoteSubject.findOne({
    _id: chapter.subject,
    isPublished: true,
  });

  if (!subject) {
    throw new apiError(400, "Publish the parent subject first.");
  }

  chapter.isPublished = true;
  await chapter.save();

  return res
    .status(200)
    .json(new apiResponse(200, "Chapter published successfully.", chapter));
};

// PATCH /api/v1/notes/admin/topics/:topicId/publish
const publishNoteTopic = async (req: AuthenticatedRequest, res: Response) => {
  const { topicId } = req.params;

  if (!mongoose.isValidObjectId(topicId)) {
    throw new apiError(400, "Invalid topic ID.");
  }

  const topic = await NoteTopic.findById(topicId);

  if (!topic) {
    throw new apiError(404, "Topic not found.");
  }

  const chapter = await NoteChapter.findOne({
    _id: topic.chapter,
    isPublished: true,
  });

  if (!chapter) {
    throw new apiError(400, "Publish the parent chapter first.");
  }

  topic.isPublished = true;
  await topic.save();

  return res
    .status(200)
    .json(new apiResponse(200, "Topic published successfully.", topic));
};

// PATCH /api/v1/notes/admin/articles/:articleId/publish
const publishNoteArticle = async (req: AuthenticatedRequest, res: Response) => {
  const { articleId } = req.params;

  if (!mongoose.isValidObjectId(articleId)) {
    throw new apiError(400, "Invalid article ID.");
  }

  const article = await NoteArticle.findById(articleId);

  if (!article) {
    throw new apiError(404, "Article not found.");
  }

  if (!article.content || article.content.length === 0) {
    throw new apiError(400, "Add article content before publishing.");
  }

  const topic = await NoteTopic.findOne({
    _id: article.topic,
    isPublished: true,
  });

  if (!topic) {
    throw new apiError(400, "Publish the parent topic first.");
  }

  const chapter = await NoteChapter.findOne({
    _id: topic.chapter,
    isPublished: true,
  });

  if (!chapter) {
    throw new apiError(400, "Publish the parent chapter first.");
  }

  const subject = await NoteSubject.findOne({
    _id: chapter.subject,
    isPublished: true,
  });

  if (!subject) {
    throw new apiError(400, "Publish the parent subject first.");
  }

  article.status = "published";
  article.publishedAt = new Date();
  article.updatedBy = req.user._id;

  await article.save();

  return res
    .status(200)
    .json(new apiResponse(200, "Article published successfully.", article));
};

export {
  getNoteSubjects,
  getNoteChapters,
  getNoteTopics,
  getNoteArticle,
  getAdminNoteSubjects,
  getAdminNoteChapters,
  getAdminNoteTopics,
  getAdminNoteArticle,
  createNoteSubject,
  createNoteChapter,
  createNoteTopic,
  createNoteArticle,
  publishNoteSubject,
  publishNoteChapter,
  publishNoteTopic,
  publishNoteArticle,
  updateNoteArticle,
};
