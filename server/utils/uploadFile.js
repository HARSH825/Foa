import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: "dj1dzoplx",
    api_key: "946241198363793",
    api_secret: "-kdMf0qG-kalUmYbRt9hvm88uI4"
});

const uploadToCloudinary = async (buffer, originalName) => {
    // console.log("Uploading to Cloudinary...");
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                resource_type: 'raw',
                folder: 'resume',
                public_id: `${Date.now()}_${originalName}`,
                format: 'pdf',
            },
            (error, result) => {
                if (error) {
                    console.error("Upload error:", error);
                    reject(error);
                } else {
                    // console.log("Uploaded:", result);
                    resolve(result.secure_url);
                }
            }
        ).end(buffer);
        // console.log("stream ended.");
    });
};

export default uploadToCloudinary;
