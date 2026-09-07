const { v2: cloudinary } = require("cloudinary");
const { Readable } = require("stream");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImage = (file) => {
  if (!file?.buffer) throw new Error("An image file is required.");

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "redux-shop/products", resource_type: "image" },
      (error, result) => (error ? reject(error) : resolve(result.secure_url))
    );
    Readable.from(file.buffer).pipe(uploadStream);
  });
};

const uploadLocalFile = async (filePath) => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: "redux-shop/products",
    resource_type: "image",
  });
  return result.secure_url;
};

const publicIdFromUrl = (imageUrl) => {
  try {
    const { pathname } = new URL(imageUrl);
    const index = pathname.indexOf("/upload/");
    if (index === -1) return null;

    const parts = pathname.slice(index + 8).split("/").filter(Boolean);
    if (parts[0]?.startsWith("v")) parts.shift();
    if (!parts.length) return null;

    const filename = parts.pop().replace(/\.[^.]+$/, "");
    return [...parts, filename].join("/");
  } catch {
    return null;
  }
};

const deleteImage = async (imageUrl) => {
  const publicId = publicIdFromUrl(imageUrl);
  if (publicId) await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
};

module.exports = { uploadImage, uploadLocalFile, deleteImage };
