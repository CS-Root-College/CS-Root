import fs from "fs"
import cloudinary from "../config/cloudinary"
import apiError from "../utils/apiError"

const uploadProfilePicture = async (
    filePath: string
) => {

    if(!filePath){
        throw new apiError(
            400,
            "Image not found"
        )
    }

    try {

        const result =
            await cloudinary.uploader.upload(
                filePath,
                {
                    resource_type: "auto"
                }
            )

        fs.unlinkSync(
            filePath
        )

        return result

    } catch (error: any) {

        if(
            fs.existsSync(
                filePath
            )
        ){
            fs.unlinkSync(
                filePath
            )
        }

        throw new apiError(
            500,
            error?.message ||
            "Cloudinary Upload Failed"
        )
    }
}

export default uploadProfilePicture