
import type { Response } from "express";
import mongoose from "mongoose";
import slugify from "slugify";

import { Resource } from "../models/resources.model";
import { User } from "../models/user.model";
import type { IResource } from "../models/resources.model";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware";

import apiError from "../utils/apiError";
import apiResponse from "../utils/apiResponse";

import { resourceValidation } from "../validation/resource.validation";

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
    res: Response
) => {
    const userId = req.user._id;

    const {
        title,
        description,
        subject,
        tags,
        content,
        assets,
        seo,
    } = resourceValidation.parse(req.body);

    if (
        content.type !== "doc" ||
        !Array.isArray(content.content) ||
        content.content.length === 0
    ) {
        throw new apiError(400, "Invalid resource content.");
    }

    const userExists = await User.exists({ _id: userId });

    if (!userExists) {
        throw new apiError(404, "User not found.");
    }

    const slug = slugify(title, {
        lower: true,
        strict: true,
        trim: true,
    });

    if (!slug) {
        throw new apiError(400, "Unable to generate resource slug.");
    }

    try {
        const resource = await Resource.create({
            title,
            slug,
            description,
            subject,
            tags: [...new Set(tags.map((tag) => tag.toLowerCase()))],
            content,
            assets,
            createdBy: userId,
            status: "draft",
            publishedAt: null,
            seo,
        });

        return res.status(201).json(
            new apiResponse(
                201,
                "Resource created successfully.",
                resource
            )
        );
    } catch (error) {
        if (isDuplicateKeyError(error)) {
            throw new apiError(
                409,
                "A resource with this title already exists."
            );
        }

        throw error;
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
