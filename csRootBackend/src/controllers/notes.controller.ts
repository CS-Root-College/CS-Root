import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

import type { AuthenticatedRequest } from "../middlewares/auth.middleware";

import {
  NoteSubject,
  NoteChapter,
  NoteTopic,
} from "../models/noteTaxonomy.model";

import {
  Article,
  type IArticleBlock,
  type ArticleStatus,
} from "../models/article.model";

import cloudinary from "../config/cloudinary";
import apiError from "../utils/apiError";
import apiResponse from "../utils/apiResponse";

function makeSlug(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validateContent(value: unknown): IArticleBlock[] {
  if (!Array.isArray(value) || value.length > 250) {
    throw new apiError(
      400,
      "Article content must be an array of up to 250 blocks"
    );
  }

  const allowedTypes = [
    "heading",
    "paragraph",
    "image",
    "list",
    "code",
    "quote",
  ];

  for (const item of value) {
    if (!item || typeof item !== "object") {
      throw new apiError(400, "Invalid article block");
    }

    const block = item as Record<string, unknown>;

    if (!allowedTypes.includes(String(block.type))) {
      throw new apiError(400, "Unsupported article block type");
    }

    if (
      ["heading", "paragraph", "code", "quote"].includes(
        String(block.type)
      ) &&
      !isNonEmptyString(block.text)
    ) {
      throw new apiError(400, "Text is required for this block");
    }

    if (block.type === "image") {
      if (!isNonEmptyString(block.src)) {
        throw new apiError(400, "Image URL is required");
      }

      try {
        const imageUrl = new URL(block.src);

        if (imageUrl.protocol !== "https:") {
          throw new Error("HTTPS required");
        }
      } catch {
        throw new apiError(400, "Image URL must be a valid HTTPS URL");
      }
    }

    if (
      block.type === "list" &&
      (!Array.isArray(block.items) ||
        !block.items.every((entry) => typeof entry === "string"))
    ) {
      throw new apiError(400, "List blocks require an array of text items");
    }

    if (
      block.type === "heading" &&
      block.level !== undefined &&
      (!Number.isInteger(block.level) ||
        Number(block.level) < 2 ||
        Number(block.level) > 4)
    ) {
      throw new apiError(400, "Heading level must be between 2 and 4");
    }
  }

  return value as IArticleBlock[];
}

// GET /api/v1/notes/subjects
export const getNoteSubjects = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const publishedArticles = await Article.find({
      status: "published",
    })
      .select("topic")
      .lean();

    const topicIds = publishedArticles.map((item) => item.topic);

    const topics = await NoteTopic.find({
      _id: { $in: topicIds },
    })
      .select("chapter")
      .lean();

    const chapterIds = topics.map((item) => item.chapter);

    const chapters = await NoteChapter.find({
      _id: { $in: chapterIds },
    })
      .select("subject")
      .lean();

    const subjectIds = chapters.map((item) => item.subject);

    const subjects = await NoteSubject.find({
      _id: { $in: subjectIds },
    })
      .select("name")
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    return res.status(200).json(
      new apiResponse(200, "Subjects fetched successfully", subjects)
    );
  } catch (error) {
    return next(error);
  }
};

// GET /api/v1/notes/subjects/:subjectId/chapters
export const getNoteChapters = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
   const subjectId = req.params.subjectId;

if (
  typeof subjectId !== "string" ||
  !mongoose.isValidObjectId(subjectId)
) {
  throw new apiError(400, "Invalid subject ID");
}

    // Aggregation query for chapters
    const chapters = await NoteChapter.aggregate([
      {
        $match: {
          subject: new mongoose.Types.ObjectId(subjectId),
        },
      },
      {
        $sort: {
          displayOrder: 1,
          name: 1,
        },
      },
    ]);

    const chapterIds = chapters.map((chapter) => chapter._id);

    const topics = await NoteTopic.find({
      chapter: { $in: chapterIds },
    })
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    const topicIds = topics.map((topic) => topic._id);

    const publishedArticles = await Article.find({
      topic: { $in: topicIds },
      status: "published",
    })
      .select("topic")
      .lean();

    const publishedTopicIds = new Set(
      publishedArticles.map((article) => String(article.topic))
    );

    const result = chapters
      .map((chapter) => ({
        _id: chapter._id,
        name: chapter.name,
        topics: topics
          .filter(
            (topic) =>
              String(topic.chapter) === String(chapter._id) &&
              publishedTopicIds.has(String(topic._id))
          )
          .map((topic) => ({
            _id: topic._id,
            name: topic.name,
          })),
      }))
      .filter((chapter) => chapter.topics.length > 0);

    return res.status(200).json(
      new apiResponse(200, "Chapters fetched successfully", result)
    );
  } catch (error) {
    return next(error);
  }
};

// GET /api/v1/notes/topics/:topicId
export const getNoteArticle = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
  const topicId = req.params.topicId;

if (
  typeof topicId !== "string" ||
  !mongoose.isValidObjectId(topicId)
) {
  throw new apiError(400, "Invalid topic ID");
}

    // Aggregation query for published article
    const matchingArticles = await Article.aggregate([
      {
        $match: {
          topic: new mongoose.Types.ObjectId(topicId),
          status: "published",
        },
      },
      {
        $project: {
          title: 1,
          content: 1,
        },
      },
      {
        $limit: 1,
      },
    ]);

    const article = matchingArticles[0];

    if (!article) {
      throw new apiError(404, "Published article not found");
    }

    return res.status(200).json(
      new apiResponse(200, "Article fetched successfully", {
        _id: article._id,
        title: article.title,
        content: article.content,
      })
    );
  } catch (error) {
    return next(error);
  }
};

// GET /api/v1/notes/admin/articles
export const getAdminArticles = async (
  _req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const articles = await Article.find()
      .populate({
        path: "topic",
        select: "name chapter",
        populate: {
          path: "chapter",
          select: "name subject",
          populate: {
            path: "subject",
            select: "name",
          },
        },
      })
      .sort({ updatedAt: -1 })
      .lean();

    return res.status(200).json(
      new apiResponse(200, "Articles fetched successfully", articles)
    );
  } catch (error) {
    return next(error);
  }
};

// POST /api/v1/notes/admin/articles
export const saveNoteArticle = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      title,
      subject,
      chapter,
      topic,
      content,
      status,
    } = req.body;

    if (
      !isNonEmptyString(title) ||
      !isNonEmptyString(subject) ||
      !isNonEmptyString(chapter) ||
      !isNonEmptyString(topic)
    ) {
      throw new apiError(
        400,
        "Title, subject, chapter and topic are required"
      );
    }

    const articleStatus: ArticleStatus =
      status === "published" ? "published" : "draft";

    const blocks = validateContent(content);

    const userId = req.user?._id;

    if (!userId) {
      throw new apiError(401, "Authentication required");
    }

    const subjectSlug = makeSlug(subject);
    const chapterSlug = makeSlug(chapter);
    const topicSlug = makeSlug(topic);

    if (!subjectSlug || !chapterSlug || !topicSlug) {
      throw new apiError(
        400,
        "Subject, chapter and topic names are invalid"
      );
    }

    const subjectDoc = await NoteSubject.findOneAndUpdate(
      { slug: subjectSlug },
      {
        $setOnInsert: {
          name: subject.trim(),
          slug: subjectSlug,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    const chapterDoc = await NoteChapter.findOneAndUpdate(
      {
        subject: subjectDoc._id,
        slug: chapterSlug,
      },
      {
        $setOnInsert: {
          subject: subjectDoc._id,
          name: chapter.trim(),
          slug: chapterSlug,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    const topicDoc = await NoteTopic.findOneAndUpdate(
      {
        chapter: chapterDoc._id,
        slug: topicSlug,
      },
      {
        $setOnInsert: {
          chapter: chapterDoc._id,
          name: topic.trim(),
          slug: topicSlug,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    const article = await Article.findOneAndUpdate(
      { topic: topicDoc._id },
      {
        $set: {
          title: title.trim(),
          content: blocks,
          status: articleStatus,
          updatedBy: userId,
        },
        $setOnInsert: {
          createdBy: userId,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true,
      }
    );

    return res.status(201).json(
      new apiResponse(201, "Article saved successfully", article)
    );
  } catch (error) {
    return next(error);
  }
};

// POST /api/v1/notes/admin/images
export const uploadNoteImage = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const file = req.file as
      | { buffer?: Buffer; mimetype?: string }
      | undefined;

    if (!file?.buffer || !file.mimetype?.startsWith("image/")) {
      throw new apiError(400, "Please select an image");
    }

    const uploadResult = await new Promise<{
      secure_url: string;
      public_id: string;
    }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "csroot/articles",
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }

          if (!result) {
            reject(new Error("Cloudinary returned no image result"));
            return;
          }

          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          });
        }
      );

      stream.end(file.buffer);
    });

    return res.status(201).json(
      new apiResponse(201, "Image uploaded successfully", uploadResult)
    );
  } catch (error) {
    return next(error);
  }
};