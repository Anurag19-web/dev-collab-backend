import express from "express";
import { getProfile, getUserByUserId, followUser } from "../controllers/userController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/profile", protect, getProfile);

router.get("/:userId", getUserByUserId);

router.patch("/follow/:userId", followUser);

export default router;