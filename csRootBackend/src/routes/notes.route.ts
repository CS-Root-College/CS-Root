import { Router } from "express";

import verifyJWT from "../middlewares/auth.middleware";
import { adminOnly } from "../middlewares/admin.middleware";

import {
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
} from "../controllers/notes.controller";

const router = Router();

// Public Notes APIs
router.get("/subjects", getNoteSubjects);
router.get("/subjects/:subjectId/chapters", getNoteChapters);
router.get("/chapters/:chapterId/topics", getNoteTopics);
router.get("/topics/:topicId", getNoteArticle);

// Admin Notes APIs
router.post("/admin/subjects", verifyJWT, adminOnly, createNoteSubject);
router.post("/admin/chapters", verifyJWT, adminOnly, createNoteChapter);
router.post("/admin/topics", verifyJWT, adminOnly, createNoteTopic);
router.post("/admin/articles", verifyJWT, adminOnly, createNoteArticle);
// Admin listing APIs
router.get(
  "/admin/subjects",
  verifyJWT,
  adminOnly,
  getAdminNoteSubjects
);

router.get(
  "/admin/subjects/:subjectId/chapters",
  verifyJWT,
  adminOnly,
  getAdminNoteChapters
);

router.get(
  "/admin/chapters/:chapterId/topics",
  verifyJWT,
  adminOnly,
  getAdminNoteTopics
);

router.get(
  "/admin/topics/:topicId/article",
  verifyJWT,
  adminOnly,
  getAdminNoteArticle
);
router.put(
  "/admin/articles/:articleId",
  verifyJWT,
  adminOnly,
  updateNoteArticle,
);

// Publish APIs
router.patch(
  "/admin/subjects/:subjectId/publish",
  verifyJWT,
  adminOnly,
  publishNoteSubject,
);

router.patch(
  "/admin/chapters/:chapterId/publish",
  verifyJWT,
  adminOnly,
  publishNoteChapter,
);

router.patch(
  "/admin/topics/:topicId/publish",
  verifyJWT,
  adminOnly,
  publishNoteTopic,
);

router.patch(
  "/admin/articles/:articleId/publish",
  verifyJWT,
  adminOnly,
  publishNoteArticle,
);

export default router;
