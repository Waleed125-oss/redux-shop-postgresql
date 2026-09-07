const path = require("path");
const multer = require("multer");
// Files stay in memory only while the request is handled. Controllers upload
// them to Cloudinary, so this works in serverless environments such as Vercel.
const storage = multer.memoryStorage();

// File Filter
const fileFilter = (req, file, cb) => {

  const allowedTypes = /jpg|jpeg|png|webp/;

  const extName = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  const mimeType = allowedTypes.test(file.mimetype);

  if (extName && mimeType) {

    cb(null, true);

  } else {

    cb(new Error("Only image files are allowed"));

  }

};

// Upload Middleware
const upload = multer({

  storage,

  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },

});

module.exports = upload;
