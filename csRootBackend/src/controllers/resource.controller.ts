
import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { Resource } from "../models/resource.model";
import apiError from "../utils/apiError";
import apiResponse from "../utils/apiResponse";
import slugify from "slugify";

const createResource = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    const {
        title,
        subject,
        description,
        content,
    } = req.body;

    // Validate required fields
    if (!title || !subject || !content) {
        throw new apiError(
            400,
            "Title, subject and content are required."
        );
    }

    // Generate slug from title
    const slug = slugify(title, {
        lower: true,
        strict: true,
        trim: true,
    });

    // Check duplicate slug
    const existingResource = await Resource.findOne({ slug });

    if (existingResource) {
        throw new apiError(
            409,
            "A resource with this title already exists."
        );
    }

    // Save resource
    const resource = await Resource.create({
        title,
        slug,
        subject,
        description,
        content,
    });

    return res.status(201).json(
        new apiResponse(
            201,
            "Resource created successfully",
            resource
        )
    );
};

const getAllResources = async (req: Request, res: Response) => {
    const { subject, search } = req.query;

    const filter: Record<string, any> = {};

    if (subject) {
        filter.subject = subject;
    }

    if (search) {
        filter.title = {
            $regex: search,
            $options: "i",
        };
    }

    const resources = await Resource.find(filter);

    return res.status(200).json(
        new apiResponse(
            200,
            "Resources fetched successfully",
            resources
        )
    );
};

const getPublishedResources = async (req: Request, res: Response) => {
    const { subject, search } = req.query;

    const filter: Record<string, any> = {
        isPublished: true,
    };

    if (subject) {
        filter.subject = subject;
    }

    if (search) {
        filter.title = {
            $regex: search,
            $options: "i",
        };
    }

    const resources = await Resource.find(filter);

    return res.status(200).json(
        new apiResponse(
            200,
            "Published resources fetched successfully",
            resources
        )
    );
};

const getPublishedResource = async (req: Request, res: Response) => {
    const slug = req.params.slug;

    if (typeof slug !== "string") {
        throw new apiError(400, "Invalid resource slug.");
    }

    const resource = await Resource.findOne({
        slug,
        isPublished: true,
    });

    if (!resource) {
        throw new apiError(404, "Published resource not found.");
    }

    return res.status(200).json(
        new apiResponse(
            200,
            "Published resource fetched successfully",
            resource
        )
    );
};

const getResource = async (req: Request, res: Response) => {
    const slug = req.params.slug;

if (typeof slug !== "string") {
    throw new apiError(400, "Invalid resource slug.");
}

    const resource = await Resource.findOne({ slug });

    if (!resource) {
        throw new apiError(404, "Resource not found.");
    }

    return res.status(200).json(
        new apiResponse(
            200,
            "Resource fetched successfully",
            resource
        )
    );
};

const updateResource = async (req: Request, res: Response) => {
    const slug = req.params.slug;

    if (typeof slug !== "string") {
        throw new apiError(400, "Invalid resource slug.");
    }

    const resource = await Resource.findOne({ slug });

    if (!resource) {
        throw new apiError(404, "Resource not found.");
    }

    const { title, subject, description, content } = req.body;

    if (title !== undefined) {
        const newSlug = slugify(title, {
            lower: true,
            strict: true,
            trim: true,
        });

        const existingResource = await Resource.findOne({
            slug: newSlug,
            _id: { $ne: resource._id },
        });

        if (existingResource) {
            throw new apiError(409, "A resource with this title already exists.");
        }

        resource.title = title;
        resource.slug = newSlug;
    }

    if (subject !== undefined) resource.subject = subject;
    if (description !== undefined) resource.description = description;
    if (content !== undefined) resource.content = content;

    await resource.save();

    return res.status(200).json(
        new apiResponse(200, "Resource updated successfully", resource)
    );
};

const deleteResource = async (req: Request, res: Response) => {
    const slug = req.params.slug;

    if (typeof slug !== "string") {
        throw new apiError(400, "Invalid resource slug.");
    }

    const resource = await Resource.findOne({ slug });

    if (!resource) {
        throw new apiError(404, "Resource not found.");
    }

    await Resource.deleteOne({ _id: resource._id });

    return res.status(200).json(
        new apiResponse(200, "Resource deleted successfully", null)
    );
};

const togglePublishResource = async (req: Request, res: Response) => {
    const slug = req.params.slug;

    if (typeof slug !== "string") {
        throw new apiError(400, "Invalid resource slug.");
    }

    const resource = await Resource.findOne({ slug });

    if (!resource) {
        throw new apiError(404, "Resource not found.");
    }

    resource.isPublished = !resource.isPublished;

    await resource.save();

    return res.status(200).json(
        new apiResponse(
            200,
            `Resource ${resource.isPublished ? "published" : "unpublished"} successfully`,
            resource
        )
    );
};
export { createResource, getAllResources,getResource,updateResource, deleteResource,togglePublishResource,getPublishedResources,getPublishedResource};
