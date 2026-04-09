import mongoose from "mongoose";
import Snippet from "../models/Snippet.js";
import User from "../models/User.js";


// CREATE SNIPPET
export const createSnippet = async (req, res) => {
  try {
    const { title, description, language, code, user } = req.body;

    if (!title || !language || !code || !user) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const foundUser = await User.findOne({ userId: user });

    if (!foundUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const snippet = await Snippet.create({
      title,
      description,
      language,
      code,
      author: foundUser._id,
    });

    const populatedSnippet = await snippet.populate(
      "author",
      "name userId profilePicture"
    );

    res.status(201).json(populatedSnippet);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// GET ALL SNIPPETS (WITH FILTER + POPULATE)
export const getSnippets = async (req, res) => {
  try {
    const filter = {};

    if (req.query.language) {
      filter.language = req.query.language;
    }

    const snippets = await Snippet.find(filter)
      .populate("author", "name userId profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json(snippets);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// GET SINGLE SNIPPET
export const getSnippetById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid snippet ID" });
    }

    const snippet = await Snippet.findById(req.params.id)
      .populate("author", "name userId profilePicture")
      .populate("reviews.user", "name profilePicture");

    if (!snippet) {
      return res.status(404).json({ message: "Snippet not found" });
    }

    res.status(200).json(snippet);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// UPDATE SNIPPET (WITH AUTH CHECK)
export const updateSnippet = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid snippet ID" });
    }

    const snippet = await Snippet.findById(req.params.id);

    if (!snippet) {
      return res.status(404).json({ message: "Snippet not found" });
    }

    if (snippet.author.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    Object.assign(snippet, req.body);

    await snippet.save();

    const updatedSnippet = await snippet.populate(
      "author",
      "name userId profilePicture"
    );

    res.status(200).json(updatedSnippet);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// DELETE SNIPPET (WITH AUTH CHECK)
export const deleteSnippet = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid snippet ID" });
    }

    const snippet = await Snippet.findById(req.params.id);

    if (!snippet) {
      return res.status(404).json({ message: "Snippet not found" });
    }

    if (snippet.author.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await snippet.deleteOne();

    res.status(200).json({ message: "Snippet deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// LIKE / UNLIKE SNIPPET
export const likeSnippet = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid snippet ID" });
    }

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Valid User ID required" });
    }

    const snippet = await Snippet.findById(req.params.id);

    if (!snippet) {
      return res.status(404).json({ message: "Snippet not found" });
    }

    const objectUserId = new mongoose.Types.ObjectId(userId);

    const alreadyLiked = snippet.likes.some(
      (id) => id.toString() === objectUserId.toString()
    );

    if (alreadyLiked) {
      snippet.likes = snippet.likes.filter(
        (id) => id.toString() !== objectUserId.toString()
      );
    } else {
      snippet.likes.push(objectUserId);
    }

    await snippet.save();

    const updatedSnippet = await snippet.populate(
      "likes",
      "name profilePicture"
    );

    res.status(200).json(updatedSnippet);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET LIKED USERS
export const getLikedUsers = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid snippet ID" });
    }

    const snippet = await Snippet.findById(req.params.id)
      .populate("likes", "name profilePicture");

    if (!snippet) {
      return res.status(404).json({ message: "Snippet not found" });
    }

    res.status(200).json({
      totalLikes: snippet.likes.length,
      users: snippet.likes
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ADD REVIEW / COMMENT
export const addReview = async (req, res) => {
  try {
    const { userId, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid snippet ID" });
    }

    if (!userId || !mongoose.Types.ObjectId.isValid(userId) || !comment) {
      return res.status(400).json({ message: "Valid userId and comment required" });
    }

    const snippet = await Snippet.findById(req.params.id);

    if (!snippet) {
      return res.status(404).json({ message: "Snippet not found" });
    }

    const review = {
      user: new mongoose.Types.ObjectId(userId),
      comment,
    };

    snippet.reviews.push(review);

    await snippet.save();

    const updatedSnippet = await snippet.populate(
      "reviews.user",
      "name profilePicture"
    );

    res.status(201).json(updatedSnippet);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// GET SNIPPETS BY USER
export const getSnippetsByUser = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const snippets = await Snippet.find({
      author: req.params.id,
    })
      .populate("author", "name userId profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json(snippets);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};