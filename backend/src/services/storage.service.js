require("dotenv").config();
const { ImageKit } = require("@imagekit/nodejs")

let imagekit = null;
function getImageKitClient() {
    if (!imagekit) {
        const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
        if (!privateKey) {
            throw new Error("IMAGEKIT_PRIVATE_KEY is not configured in environment variables.");
        }
        imagekit = new ImageKit({ privateKey });
    }
    return imagekit;
}

async function uploadFile(file, folder = "/spotify/music", fileNamePrefix = "_file") {
    const client = getImageKitClient();
    const result = await client.files.upload({
        file: file,
        fileName: fileNamePrefix + Date.now(),
        folder: folder
    });

    return result;
}

module.exports = uploadFile;