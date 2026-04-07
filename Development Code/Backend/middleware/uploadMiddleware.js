const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Helper to ensure directories exist
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const storage = (folderName) => multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, `../../uploads/${folderName}`);
    ensureDir(uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (JPEG, JPG, PNG, WEBP) are allowed!"), false);
  }
};

const uploadPrescription = multer({
  storage: storage("prescriptions"),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter
});

const uploadProfile = multer({
  storage: storage("profiles"),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit for profiles
  fileFilter: fileFilter
});

module.exports = { uploadPrescription, uploadProfile };
