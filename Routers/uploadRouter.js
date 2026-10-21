const express = require("express");
const multer = require("multer");
const {
  uploadImageToCloudinary,
  uploadProfileImageToCloudinary,
} = require("../Controllers/uploadController");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router
  .post("/upload-image", upload.single("file"), uploadImageToCloudinary)
  .post(
    "/upload-profile-image",
    upload.single("file"),
    uploadProfileImageToCloudinary,
  );

module.exports = router;
