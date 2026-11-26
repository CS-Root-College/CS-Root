import cloudinary from "../config/cloudinary";
import type { UploadApiResponse } from "cloudinary";
import { randomUUID } from "crypto";

export const uploadResourceImage = (
    file: Express.Multer.File
): Promise<UploadApiResponse> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "resources/content",
                public_id: randomUUID(),
                resource_type: "image",
            },
            (error, result) => {
                if (error) return reject(error);
                if (!result) return reject(new Error("Image upload failed"));

                resolve(result);
            }
        );

        uploadStream.end(file.buffer);
    });
};

export const deleteResourceImage = async (
    publicId: string
) => {
    return cloudinary.uploader.destroy(publicId, {
        resource_type: "image",
    });
};

export const deleteResourceImages = async (
    publicIds: string[]
) => {
    if (!publicIds.length) return;

    return cloudinary.api.delete_resources(publicIds, {
        resource_type: "image",
    });
};