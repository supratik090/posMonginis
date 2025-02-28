const express = require("express");
const multer = require("multer");
const { uploadPDF } = require("./../controllers/uploadController");

const router = express.Router();

// Set up multer for file upload
const upload = multer({ dest: "uploads/" });

// Route for uploading PDF
router.post("/upload", upload.single("pdf"), uploadPDF);

module.exports = router;
