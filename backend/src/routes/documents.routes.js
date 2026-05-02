const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const documentsController = require("../controllers/documents.controller");
const { requireAuth } = require("../middleware/auth");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../../uploads")),
  filename: (req, file, cb) => cb(null, `${Date.now()}-doc-${file.originalname.replace(/\s+/g, "_")}`),
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

router.use(requireAuth);

router.get("/", documentsController.getDocuments);
router.post("/", upload.single("file"), documentsController.uploadDocument);
router.delete("/:id", documentsController.deleteDocument);

module.exports = router;
