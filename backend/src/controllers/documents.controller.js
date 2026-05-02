const Document = require("../models/Document");

exports.getDocuments = async (req, res) => {
  const query = {
    $or: [
      { owner: req.user._id },
      { visibility: req.user.role },
      { visibility: { $size: 0 } }
    ]
  };
  
  if (req.user.role === "admin") {
    delete query.$or; // Admin sees all
  }

  const docs = await Document.find(query).populate("owner").sort("-createdAt");
  res.json({ success: true, data: docs });
};

exports.uploadDocument = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const doc = await Document.create({
    title: req.body.title,
    description: req.body.description,
    type: req.body.type,
    owner: req.body.owner || req.user._id,
    visibility: req.body.visibility ? req.body.visibility.split(",") : ["admin"],
    fileUrl: `/uploads/${req.file.filename}`,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, data: doc });
};

exports.deleteDocument = async (req, res) => {
  const doc = await Document.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: "Document not found" });

  if (req.user.role !== "admin" && String(doc.createdBy) !== String(req.user._id)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  await Document.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Document deleted" });
};
