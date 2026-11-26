
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
    const uploadedPublicIds: string[] = [];
    let resourceCreated = false;

    try {
        const userId = req.user?.userId;

        if (!userId || !Types.ObjectId.isValid(userId)) {
            throw new apiError(401, "Unauthorized.");
        }

        const user = await User.findById(userId);

        if (!user) {
            throw new apiError(404, "User not found.");
        }

        if (!hasPremiumAccess(user)) {
            throw new apiError(403, "Premium subscription required to create a resource.");
        }

        const files = (req.files || []) as Express.Multer.File[];

        const {
            title,
            description = "",
            subject,
            tags = "[]",
            content,
        } = req.body;

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
            throw new apiError(400, "Description must not exceed 500 characters.");
        }

        let parsedContent: Record<string, any>;
        let parsedTags: string[];

        try {
            parsedContent =
                typeof content === "string" ? JSON.parse(content) : content;

            parsedTags =
                typeof tags === "string" ? JSON.parse(tags) : tags;
        } catch {
            throw new apiError(400, "Invalid content or tags format.");
        }

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

        if (!parsedTags.every((tag: unknown) => typeof tag === "string")) {
            throw new apiError(400, "Invalid tags.");
        }

        const uploadedAssets: IResourceAsset[] = [];

        for (const file of files) {
            const result = await uploadResourceImage(file);

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
                caption: "",
            });
        }

        const contentWithImages = structuredClone(parsedContent);

        const replaceImageSources = (node: any) => {
            if (!node || typeof node !== "object") return;

            if (node.type === "image" && node.attrs?.src) {
                const src = node.attrs.src;

                if (typeof src === "string" && src.startsWith("upload://")) {
                    const index = Number(src.replace("upload://", ""));

                    if (
                        !Number.isInteger(index) ||
                        index < 0 ||
                        index >= uploadedAssets.length
                    ) {
                        throw new apiError(400, "Invalid image upload reference.");
                    }

                    node.attrs.src = uploadedAssets[index]?.secureUrl;
                }
            }

            if (Array.isArray(node.content)) {
                node.content.forEach(replaceImageSources);
            }
        };

        replaceImageSources(contentWithImages);

        const baseSlug = slugify(title, {
            lower: true,
            strict: true,
            trim: true,
        });

        if (!baseSlug) {
            throw new apiError(400, "A valid title is required.");
        }

        let slug = baseSlug;
        let suffix = 1;

        while (await Resource.exists({ slug })) {
            slug = `${baseSlug}-${suffix++}`;
        }

        const resource = await Resource.create({
            title: title.trim(),
            slug,
            description: description.trim(),
            subject: subject.trim(),
            tags: [...new Set(parsedTags.map((tag: string) => tag.trim()).filter(Boolean))],
            content: contentWithImages,
            assets: uploadedAssets,
            createdBy: user._id,
            status: "published",
            publishedAt: null,
            isFeatured: false,
            viewCount: 0,
            seo: {
                title: title.trim(),
                description: description.trim().slice(0, 160),
            },
        });

        resourceCreated = true;

        return res.status(201).json(
            new apiResponse(201, "Resource created successfully.", resource)
        );
    } catch (error) {
        if (!resourceCreated && uploadedPublicIds.length) {
            try {
                await deleteResourceImages(uploadedPublicIds);
            } catch (cleanupError) {
                console.error("Cloudinary rollback failed:", cleanupError);
            }
        }

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
