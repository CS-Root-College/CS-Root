
import { Router } from "express";

import verifyJWT from "../middlewares/auth.middleware";
import { adminOnly } from "../middlewares/admin.middleware";

import {
    createResource,
    getPublishedResources,
    getPublishedResource,
    updateResource,
    publishResource,
    archiveResource,
    deleteResource,
} from "../controllers/resource.controller";

const router = Router();

router.post("/create-resource", verifyJWT, adminOnly, createResource);

router.get("/get-all-resources", getPublishedResources);
router.get("/get-resource/:slug", getPublishedResource);

router.patch("/update-resource/:resourceId", verifyJWT, adminOnly, updateResource);
router.patch("/publish-resource/:resourceId", verifyJWT, adminOnly, publishResource);
router.patch("/archive-resource/:resourceId", verifyJWT, adminOnly, archiveResource);

router.delete("/delete-resource/:resourceId", verifyJWT, adminOnly, deleteResource);

export default router;
