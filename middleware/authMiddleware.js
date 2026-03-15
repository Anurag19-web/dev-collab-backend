import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  try {

    // get userId from body, params or headers
    const userId =
      req.body.user ||
      req.params.userId ||
      req.headers["userid"];

    if (!userId) {
      return res.status(401).json({ message: "No userId provided" });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;

    next();

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Auth error" });
  }
};

export default authMiddleware;