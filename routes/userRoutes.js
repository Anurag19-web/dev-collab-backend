import express from "express";
import mongoose from "mongoose";
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


// 🔁 Follow / Unfollow user (controller handles logic)
router.patch("/follow/:userId", protect, followUser);


// 🖼 Update profile (with image upload + replace)
router.patch(
  "/update-profile/:userId",
  protect,
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      const userId = req.params.userId;

      // ✅ validate ID
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ msg: "Invalid user ID" });
      }

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      // 🧠 If new image uploaded → delete old one
      if (req.file && req.file.path) {
        if (user.public_id) {
          await cloudinary.uploader.destroy(user.public_id);
        }

        user.profilePicture = req.file.path;
        user.public_id = req.file.filename;
      }

      // 🧾 Update fields safely
      user.name = req.body.name || user.name;
      user.role = req.body.role || user.role;
      user.bio = req.body.bio || user.bio;
      user.github = req.body.github || user.github;
      user.linkedin = req.body.linkedin || user.linkedin;
      user.portfolio = req.body.portfolio || user.portfolio;

      // ✅ handle skills array properly
      if (req.body.skills) {
        user.skills = Array.isArray(req.body.skills)
          ? req.body.skills
          : req.body.skills.split(",").map(s => s.trim());
      }

      await user.save();

      res.status(200).json({
        success: true,
        user
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Server error" });
    }
  }
);


// 🗑 Delete profile image
router.delete("/delete-profile-image/:userId", protect, async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ msg: "Invalid user ID" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (user.public_id) {
      await cloudinary.uploader.destroy(user.public_id);
    }

    user.profilePicture = "";
    user.public_id = "";

    await user.save();

    res.status(200).json({
      success: true,
      msg: "Image deleted"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});


// 🔍 SEARCH USERS
router.get("/search", async (req, res) => {
  try {
    const query = req.query.q?.trim();

    if (!query) {
      return res.status(200).json([]);
    }

    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { userId: { $regex: query, $options: "i" } }
      ]
    }).select("name userId profilePicture");

    res.status(200).json(users);

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
});


// 👥 GET FOLLOWERS
router.get("/followers/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ msg: "Invalid user ID" });
    }

    const user = await User.findById(userId)
      .populate("followers", "name email profilePicture");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.status(200).json({
      success: true,
      count: user.followers.length,
      followers: user.followers
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});


// 👥 GET FOLLOWING
router.get("/following/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ msg: "Invalid user ID" });
    }

    const user = await User.findById(userId)
      .populate("following", "name email profilePicture");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.status(200).json({
      success: true,
      count: user.following.length,
      following: user.following
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});


// 👤 Visit other user profile (⚠️ KEEP LAST)
router.get("/:userId", getUserByUserId);


export default router;