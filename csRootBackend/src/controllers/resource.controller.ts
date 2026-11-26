
import type { Response, NextFunction } from "express";
import mongoose, {Types} from "mongoose";
import slugify from "slugify";

import { Resource } from "../models/resources.model";
import { User } from "../models/user.model";
import type { IResource, IResourceAsset } from "../models/resources.model";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware";

import apiError from "../utils/apiError";
import apiResponse from "../utils/apiResponse";

import { resourceValidation } from "../validation/resource.validation";
import { hasPremiumAccess } from "../utils/hasPremium";
import { deleteResourceImages, uploadResourceImage } from "../service/resourceAsset.service";

const isDuplicateKeyError = (error: unknown): boolean => {
    return (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === 11000
    );
};

const createResource = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    console.log("\n========== CREATE RESOURCE START ==========");

    const uploadedPublicIds: string[] = [];
    let resourceCreated = false;

    try {
        console.log("[1] Request information:", {
            method: req.method,
            url: req.originalUrl,
            userId: req.user?.userId,
            contentType: req.headers["content-type"]
        });

        const userId = req.user?._id;

        console.log("[2] Validating user ID:", userId);

        if (!userId || !Types.ObjectId.isValid(userId)) {
            throw new apiError(401, "Unauthorized.");
        }

        console.log("[3] Fetching user from MongoDB");

        const user = await User.findById(userId);

        console.log("[3] User result:", {
            found: Boolean(user),
            id: user?._id
        });

        if (!user) {
            throw new apiError(404, "User not found.");
        }

        console.log("[4] Checking premium access");

        const premiumAccess = hasPremiumAccess(user);

        console.log("[4] Premium access result:", premiumAccess);

        if (!premiumAccess) {
            throw new apiError(
                403,
                "Premium subscription required to create a resource."
            );
        }

        console.log("[5] Checking uploaded files");

        const files = (req.files || []) as Express.Multer.File[];

        console.log("[5] Files received:", files.length);

        files.forEach((file, index) => {
            console.log(`[5.${index + 1}] File information:`, {
                name: file.originalname,
                type: file.mimetype,
                size: file.size,
                fieldname: file.fieldname
            });
        });

        console.log("[6] Body keys:", Object.keys(req.body || {}));

        const {
            title,
            description = "",
            subject,
            tags = "[]",
            content
        } = req.body;

        console.log("[7] Received data:", {
            title,
            description,
            subject,
            tags,
            contentType: typeof content,
            contentLength:
                typeof content === "string" ? content.length : undefined
        });

        if (typeof title !== "string" || !title.trim()) {
            throw new apiError(400, "Title is required.");
        }

        if (typeof subject !== "string" || !subject.trim()) {
            throw new apiError(400, "Subject is required.");
        }

        if (
            typeof description !== "string" ||
            description.length > 500
        ) {
            throw new apiError(
                400,
                "Description must not exceed 500 characters."
            );
        }

        console.log("[8] Parsing content and tags");

        let parsedContent: Record<string, any>;
        let parsedTags: string[];

        try {
            parsedContent =
                typeof content === "string"
                    ? JSON.parse(content)
                    : content;

            parsedTags =
                typeof tags === "string"
                    ? JSON.parse(tags)
                    : tags;

            console.log("[8] Parsing successful");
        } catch (parseError) {
            console.error("[8] Parsing error:", parseError);
            throw new apiError(400, "Invalid content or tags format.");
        }

        console.log("[9] Content validation:", {
            contentType: parsedContent?.type,
            contentLength: parsedContent?.content?.length
        });

        console.log("[9] Tags:", parsedTags);

        if (
            !parsedContent ||
            parsedContent.type !== "doc" ||
            !Array.isArray(parsedContent.content)
        ) {
            throw new apiError(400, "Invalid resource content.");
        }

        if (!Array.isArray(parsedTags)) {
            throw new apiError(400, "Tags must be an array.");
        }

        if (
            !parsedTags.every(
                (tag: unknown) => typeof tag === "string"
            )
        ) {
            throw new apiError(400, "Invalid tags.");
        }

        console.log("[10] Starting Cloudinary upload process");

        const uploadedAssets: IResourceAsset[] = [];

        for (let index = 0; index < files.length; index++) {
            const file = files[index];

            if (!file) {
                console.warn(`[10.${index + 1}] File missing at index`);
                continue;
            }

            console.log(`[10.${index + 1}] Uploading file:`, {
                name: file.originalname,
                type: file.mimetype,
                size: file.size
            });

            const result = await uploadResourceImage(file);

            console.log(`[10.${index + 1}] Upload successful:`, {
                publicId: result.public_id,
                secureUrl: result.secure_url,
                format: result.format,
                bytes: result.bytes,
                width: result.width,
                height: result.height
            });

            uploadedPublicIds.push(result.public_id);

            uploadedAssets.push({
                publicId: result.public_id,
                secureUrl: result.secure_url,
                purpose: "content",
                format: result.format,
                bytes: result.bytes,
                width: result.width,
                height: result.height,
                altText: "",
                caption: ""
            });
        }

        console.log("[11] Total uploaded assets:", uploadedAssets.length);

        console.log("[12] Cloning content");

        const contentWithImages = structuredClone(parsedContent);

        const replaceImageSources = (node: any): void => {
            if (!node || typeof node !== "object") return;

            if (
                node.type === "image" &&
                node.attrs?.src
            ) {
                const src = node.attrs.src;

                console.log("[12] Found image node:", src);

                if (
                    typeof src === "string" &&
                    src.startsWith("upload://")
                ) {
                    const index = Number(
                        src.replace("upload://", "")
                    );

                    console.log("[12] Image index:", index);
                    console.log("[12] Assets available:", uploadedAssets.length);

                    if (
                        !Number.isInteger(index) ||
                        index < 0 ||
                        index >= uploadedAssets.length
                    ) {
                        console.error("[12] Invalid image reference:", {
                            src,
                            index,
                            uploadedAssetsLength: uploadedAssets.length
                        });

                        throw new apiError(
                            400,
                            "Invalid image upload reference."
                        );
                    }

                    const asset = uploadedAssets[index];

                    if (!asset) {
                        throw new apiError(
                            400,
                            "Uploaded image asset not found."
                        );
                    }

                    node.attrs.src = asset.secureUrl;

                    console.log("[12] Image source replaced:", {
                        index,
                        secureUrl: asset.secureUrl
                    });
                }
            }

            if (Array.isArray(node.content)) {
                node.content.forEach(replaceImageSources);
            }
        };

        console.log("[13] Replacing image sources");

        replaceImageSources(contentWithImages);

        console.log("[13] Final content:", contentWithImages);

        console.log("[14] Generating slug");

        const baseSlug = slugify(title, {
            lower: true,
            strict: true,
            trim: true
        });

        console.log("[14] Base slug:", baseSlug);

        if (!baseSlug) {
            throw new apiError(400, "A valid title is required.");
        }

        let slug = baseSlug;
        let suffix = 1;

        console.log("[15] Checking slug uniqueness");

        while (await Resource.exists({ slug })) {
            console.log("[15] Slug exists:", slug);

            slug = `${baseSlug}-${suffix++}`;
        }

        console.log("[15] Final slug:", slug);

        console.log("[16] Creating resource in MongoDB");

        const resource = await Resource.create({
            title: title.trim(),
            slug,
            description: description.trim(),
            subject: subject.trim(),
            tags: [
                ...new Set(
                    parsedTags
                        .map((tag: string) => tag.trim())
                        .filter(Boolean)
                )
            ],
            content: contentWithImages,
            assets: uploadedAssets,
            createdBy: user._id,
            status: "published",
            publishedAt: new Date(),
            isFeatured: false,
            viewCount: 0,
            seo: {
                title: title.trim(),
                description: description.trim().slice(0, 160)
            }
        });

        resourceCreated = true;

        console.log("[17] Resource successfully created:", {
            id: resource._id,
            title: resource.title,
            slug: resource.slug,
            status: resource.status,
            assets: resource.assets.length
        });

        console.log("========== CREATE RESOURCE SUCCESS ==========\n");

        return res.status(201).json(
            new apiResponse(
                201,
                "Resource created successfully.",
                resource
            )
        );
    } catch (error) {
        console.error("\n========== CREATE RESOURCE ERROR ==========");
        console.error("[ERROR]", error);
        console.error(
            "[ERROR STACK]",
            error instanceof Error ? error.stack : undefined
        );

        if (!resourceCreated && uploadedPublicIds.length > 0) {
            console.log("[ROLLBACK] Removing Cloudinary assets:", uploadedPublicIds);

            try {
                await deleteResourceImages(uploadedPublicIds);

                console.log("[ROLLBACK] Cloudinary cleanup completed");
            } catch (cleanupError) {
                console.error("[ROLLBACK] Cleanup failed:", cleanupError);
            }
        }

        console.error("========== CREATE RESOURCE FAILED ==========\n");

        next(error);
    }
};

const getResources = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const resources = await Resource.find()
    .sort({ createdAt: -1 })
    .populate("createdBy", "username email")
    .lean();

  return res.status(200).json(
    new apiResponse(
      200,
      "Resources fetched successfully.",
      resources
    )
  );
};

const getResourceById = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    const { resourceId } = req.params;

    if (!mongoose.isValidObjectId(resourceId)) {
        throw new apiError(400, "Invalid resource ID.");
    }

    const resource = await Resource.findById(resourceId)
        .populate("createdBy", "username email");

    if (!resource) {
        throw new apiError(404, "Resource not found.");
    }

    return res.status(200).json(
        new apiResponse(
            200,
            "Resource fetched successfully.",
            resource
        )
    );
};

const updateResource = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    const { resourceId } = req.params;

    if (!mongoose.isValidObjectId(resourceId)) {
        throw new apiError(400, "Invalid resource ID.");
    }

    const updates = resourceValidation.partial().parse(req.body);

    if (Object.keys(updates).length === 0) {
        throw new apiError(400, "Provide at least one field to update.");
    }

    if (
        updates.content &&
        (
            updates.content.type !== "doc" ||
            !Array.isArray(updates.content.content) ||
            updates.content.content.length === 0
        )
    ) {
        throw new apiError(400, "Invalid resource content.");
    }

    const updateData = { ...updates } as Partial<IResource>;

    if (updates.tags) {
        updateData.tags = [
            ...new Set(updates.tags.map((tag) => tag.toLowerCase())),
        ];
    }

    if (updates.title) {
        const slug = slugify(updates.title, {
            lower: true,
            strict: true,
            trim: true,
        });

        if (!slug) {
            throw new apiError(400, "Unable to generate resource slug.");
        }

        updateData.slug = slug;
    }

    try {
        const resource = await Resource.findByIdAndUpdate(
            resourceId,
            { $set: updateData },
            {
                new: true,
                runValidators: true,
            }
        ).populate("createdBy", "username email");

        if (!resource) {
            throw new apiError(404, "Resource not found.");
        }

        return res.status(200).json(
            new apiResponse(
                200,
                "Resource updated successfully.",
                resource
            )
        );
    } catch (error) {
        if (isDuplicateKeyError(error)) {
            throw new apiError(
                409,
                "This resource title is already taken."
            );
        }

        throw error;
    }
};

const publishResource = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    const { resourceId } = req.params;

    if (!mongoose.isValidObjectId(resourceId)) {
        throw new apiError(400, "Invalid resource ID.");
    }

    const resource = await Resource.findById(resourceId);

    if (!resource) {
        throw new apiError(404, "Resource not found.");
    }

    if (
        resource.content.type !== "doc" ||
        !Array.isArray(resource.content.content) ||
        resource.content.content.length === 0
    ) {
        throw new apiError(400, "Add content before publishing.");
    }

    resource.status = "published";
    resource.publishedAt = new Date();

    await resource.save();

    return res.status(200).json(
        new apiResponse(
            200,
            "Resource published successfully.",
            resource
        )
    );
};

const archiveResource = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    const { resourceId } = req.params;

    if (!mongoose.isValidObjectId(resourceId)) {
        throw new apiError(400, "Invalid resource ID.");
    }

    const resource = await Resource.findById(resourceId);

    if (!resource) {
        throw new apiError(404, "Resource not found.");
    }

    resource.status = "archived";

    await resource.save();

    return res.status(200).json(
        new apiResponse(
            200,
            "Resource archived successfully.",
            resource
        )
    );
};

const deleteResource = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    const { resourceId } = req.params;

    if (!mongoose.isValidObjectId(resourceId)) {
        throw new apiError(400, "Invalid resource ID.");
    }

    const resource = await Resource.findByIdAndDelete(resourceId);

    if (!resource) {
        throw new apiError(404, "Resource not found.");
    }

    return res.status(200).json(
        new apiResponse(
            200,
            "Resource deleted successfully.",
            { resourceId }
        )
    );
};


const getPublishedResources = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    const resources = await Resource.find({ status: "published" })
        .select("-content")
        .sort({ publishedAt: -1 })
        .populate("createdBy", "username")
        .lean();

    return res.status(200).json(
        new apiResponse(200, "Resources fetched successfully.", resources)
    );
};

const getPublishedResource = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    const slug = req.params.slug;

    if (typeof slug !== "string" || !slug.trim()) {
        throw new apiError(400, "Invalid resource slug.");
    }

    const resource = await Resource.findOne({
        slug,
        status: "published",
    })
        .populate("createdBy", "username");

    if (!resource) {
        throw new apiError(404, "Resource not found.");
    }

    return res.status(200).json(
        new apiResponse(200, "Resource fetched successfully.", resource)
    );
};


export {
    createResource,
    getResources,
    getResourceById,
    updateResource,
    publishResource,
    archiveResource,
    deleteResource,
    getPublishedResource,
    getPublishedResources
};
