const multer = require("multer");
const path = require("path");
const fs = require("fs");

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "video/mp4",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MAX_FILE_SIZE = 20 * 1024 * 1024;

function createStorage(destFolder) {
  const dest = path.join(process.cwd(), "uploads", destFolder);
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dest),
    filename: (req, file, cb) => {
      const dateStr = new Date()
        .toISOString()
        .replace(/[-:T]/g, "")
        .slice(0, 14);
      const ext = path.extname(file.originalname);
      cb(null, `${destFolder}_${dateStr}_${Date.now()}${ext}`);
    },
  });
}

function fileFilter(req, file, cb) {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed: ${file.mimetype}`), false);
  }
}

const chatUpload = multer({
  storage: createStorage("attachments"),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

const supportUpload = multer({
  storage: createStorage("support"),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

module.exports = { chatUpload, supportUpload };
