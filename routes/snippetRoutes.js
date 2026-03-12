import express from "express";
import {
  addReview,
  createSnippet,
  deleteSnippet,
  getSnippetById,
  getSnippets,
  likeSnippet,
  updateSnippet
} from "../controllers/snippetController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", authMiddleware, createSnippet);
router.get("/", getSnippets);
router.get("/:id", getSnippetById);
router.put("/:id", authMiddleware, updateSnippet);
router.delete("/:id", authMiddleware, deleteSnippet);
router.patch("/:id/like", authMiddleware, likeSnippet);
router.post("/:id/review", authMiddleware, addReview);

export default router;