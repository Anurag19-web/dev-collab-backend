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

    const user = await User.findOneAndUpdate(
      { userId: req.params.userId },
      {
        name: req.body.name,
        role: req.body.role,
        bio: req.body.bio,
        github: req.body.github,
        linkedin: req.body.linkedin,
        portfolio: req.body.portfolio,
        skills: req.body.skills
      },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

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