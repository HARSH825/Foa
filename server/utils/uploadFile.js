import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: "dj1dzoplx",
    api_key: "946241198363793",
    api_secret: "-kdMf0qG-kalUmYbRt9hvm88uI4"
});

const sanitizeFilename = (filename) => {
    return filename
        .replace(/[^a-zA-Z0-9._-]/g, '_') 
        .replace(/_{2,}/g, '_') 
        .replace(/^_+|_+$/g, '') 
        .substring(0, 100); 
};

const uploadToCloudinary = async (buffer, originalName) => {
    return new Promise((resolve, reject) => {
        const sanitizedName = sanitizeFilename(originalName);
        const publicId = `${Date.now()}_${sanitizedName}`;
        
        cloudinary.uploader.upload_stream(
            {
                resource_type: 'raw',
                folder: 'resume',
                public_id: publicId,
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