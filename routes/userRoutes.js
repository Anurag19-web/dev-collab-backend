import express from "express";
import {
  getProfile,
  getUserByUserId,
  followUser
} from "../controllers/userController.js";

import protect from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import upload from "../middleware/uploadMiddleware.js";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();


// 🔐 Logged-in user profile
router.get("/profile", protect, getProfile);


// 🔁 Follow / Unfollow user
router.patch("/follow/:userId", followUser);


// 🖼 Update profile (with image upload + replace)
router.patch(
  "/update-profile/:userId",
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      const user = await User.findOne({ userId: req.params.userId });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // 🧠 If new image uploaded → delete old one from Cloudinary
      if (req.file) {
        if (user.public_id) {
          await cloudinary.uploader.destroy(user.public_id);
        }

        user.profilePicture = req.file.path;
        user.public_id = req.file.filename;
      }

      // 🧾 Update other fields
      user.name = req.body.name || user.name;
      user.role = req.body.role || user.role;
      user.bio = req.body.bio || user.bio;
      user.github = req.body.github || user.github;
      user.linkedin = req.body.linkedin || user.linkedin;
      user.portfolio = req.body.portfolio || user.portfolio;
      user.skills = req.body.skills || user.skills;

      await user.save();

      res.json(user);

    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);


// 🗑 Delete profile image
router.delete("/delete-profile-image/:userId", async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.public_id) {
      await cloudinary.uploader.destroy(user.public_id);
    }

    user.profilePicture = "";
    user.public_id = "";

    await user.save();

    res.json({ message: "Image deleted" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 🔍 SEARCH USERS (by name + userId)
router.get("/search", async (req, res) => {
  try {
    const query = req.query.q?.trim();

    if (!query) return res.json([]);

    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { userId: { $regex: query, $options: "i" } }
      ]
    }).select("name userId profilePicture");

    res.json(users);

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});


// 👤 Visit other user profile (⚠️ ALWAYS LAST)
router.get("/:userId", getUserByUserId);


export default router;