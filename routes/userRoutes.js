import express from "express";
import {
  getProfile,
  getUserByUserId,
  followUser,
  updateUserProfile
} from "../controllers/userController.js";

import protect from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();


// logged-in user profile
router.get("/profile", protect, getProfile);


// visit other user profile
router.get("/:userId", getUserByUserId);


// update profile
router.patch("/:userId", updateUserProfile);


// follow / unfollow user
router.patch("/follow/:userId", followUser);

router.patch("/update-profile/:id", upload.single("profilePicture"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    // 🧠 If new image uploaded → delete old one
    if (req.file) {

      if (user.public_id) {
        const cloudinary = (await import("../config/cloudinary.js")).default;
        await cloudinary.uploader.destroy(user.public_id);
      }

      user.profilePicture = req.file.path;
      user.public_id = req.file.filename;
    }

    // update other fields
    user.name = req.body.name || user.name;
    user.bio = req.body.bio || user.bio;

    await user.save();

    res.json(user);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/delete-profile-image/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

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

export default router;