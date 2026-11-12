
import { Router } from "express";
import multer from "multer";

import verifyJWT from "../middlewares/auth.middleware";
import requireAdmin from "../middlewares/admin.middleware";

import {
  getNoteSubjects,
  getNoteChapters,
  getNoteArticle,
  getAdminArticles,
  saveNoteArticle,
  uploadNoteImage,
} from "../controllers/notes.controller";

const router = Router();

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      callback(new Error("Only image files are allowed"));
      return;
    }

    callback(null, true);
  },
});

// Public student routes
router.get("/subjects", getNoteSubjects);

router.get(
  "/subjects/:subjectId/chapters",
  getNoteChapters
);

router.get(
  "/topics/:topicId",
  getNoteArticle
);

// Admin-only article management
router.get(
  "/admin/articles",
  verifyJWT,
  requireAdmin,
  getAdminArticles
);

router.post(
  "/admin/articles",
  verifyJWT,
  requireAdmin,
  saveNoteArticle
);

// Admin-only image upload
router.post(
  "/admin/images",
  verifyJWT,
  requireAdmin,
  imageUpload.single("image"),
  uploadNoteImage
);

export default router;
