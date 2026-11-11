
import { Router } from "express";
import { createResource , getAllResources,  getResource, updateResource, deleteResource,togglePublishResource, getPublishedResources,  getPublishedResource} from "../controllers/resource.controller";
import verifyJWT from "../middlewares/auth.middleware";
import verifyAdmin from "../middlewares/admin.middleware";
const router = Router();

router.post("/create-resource", verifyJWT, verifyAdmin, createResource);
router.get("/get-all-resources", verifyJWT, verifyAdmin, getAllResources);
router.get("/get-resource/:slug", verifyJWT, verifyAdmin, getResource);
router.patch("/update-resource/:slug", verifyJWT, verifyAdmin, updateResource);
router.delete("/delete-resource/:slug", verifyJWT, verifyAdmin, deleteResource);
router.patch("/toggle-publish/:slug", verifyJWT, verifyAdmin, togglePublishResource);

router.get("/student/resources", getPublishedResources);
router.get("/student/resources/:slug", getPublishedResource);

export default router;
