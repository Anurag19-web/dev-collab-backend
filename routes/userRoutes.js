import express from "express";
import {
  getProfile,
  getUserByUserId,
  followUser,
  updateUserProfile
} from "../controllers/userController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();


// logged-in user profile
router.get("/profile", protect, getProfile);


// visit other user profile
router.get("/:userId", getUserByUserId);


// update profile
router.patch("/:userId", updateUserProfile);


// follow / unfollow user
router.patch("/follow/:userId", followUser);


export default router;