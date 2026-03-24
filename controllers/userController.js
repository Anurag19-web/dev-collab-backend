import User from "../models/User.js";

// GET logged-in user profile
export const getProfile = async (req, res) => {
  try {

    const user = await User.findOne({ userId: req.user.userId }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET user by userId (for visiting profiles)
export const getUserByUserId = async (req, res) => {

  try {

    const user = await User.findOne({ userId: req.params.userId }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }

};

// UPDATE USER PROFILE
export const updateUserProfile = async (req, res) => {
  try {

    const user = await User.findOne({ userId: req.params.userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🖼 Handle image upload
    if (req.file) {
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
    user.skills = req.body.skills || user.skills;

    await user.save();

    res.json(user);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// FOLLOW / UNFOLLOW user
export const followUser = async (req, res) => {

  try {

    const { currentUserId } = req.body;

    const userToFollow = await User.findOne({ userId: req.params.userId });
    const currentUser = await User.findOne({ userId: currentUserId });

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFollowing = userToFollow.followers.includes(currentUserId);

    if (isFollowing) {

      userToFollow.followers = userToFollow.followers.filter(
        (id) => id !== currentUserId
      );

      currentUser.following = currentUser.following.filter(
        (id) => id !== req.params.userId
      );

    } else {

      userToFollow.followers.push(currentUserId);
      currentUser.following.push(req.params.userId);

    }

    await userToFollow.save();
    await currentUser.save();

    res.json(userToFollow);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }

};