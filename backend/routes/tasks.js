import express from "express";
import multer from "multer";
import {
  uploadTasks,
  getTasksByAgent,
  updateTaskStatus,
  getAllTasks,
  deleteTask,
} from "../controllers/taskController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only CSV, XLS, and XLSX files are allowed."
        ),
        false
      );
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Error handling middleware for multer errors
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      errors: [err.message],
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      errors: [err.message || "Error processing file"],
    });
  }
  next();
};

// All routes require authentication
router.use(auth);

// Routes
router.get("/", getAllTasks);
router.post("/upload", upload.single("file"), handleMulterError, uploadTasks);
router.get("/agent/:agentId", getTasksByAgent);
router.put("/:taskId/status", updateTaskStatus);
router.delete("/:taskId", deleteTask);

export default router;
