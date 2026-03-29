import express from "express";
import {
  addReview,
  createSnippet,
  deleteSnippet,
  getSnippetById,
  getSnippets,
  likeSnippet,
  updateSnippet,
  getSnippetsByUser
} from "../controllers/snippetController.js";

const router = express.Router();

router.post("/create", createSnippet);

router.get("/", getSnippets);

router.get("/user/:id", getSnippetsByUser);

router.get("/:id", getSnippetById);

router.put("/:id", updateSnippet);

router.delete("/:id", deleteSnippet);

router.patch("/:id/like", likeSnippet);

router.post("/:id/review", addReview);

export default router;