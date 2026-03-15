import Snippet from "../models/Snippet.js";


// CREATE SNIPPET
export const createSnippet = async (req, res) => {
  try {

    const { title, code, language } = req.body;

    const snippet = await Snippet.create({
      title,
      code,
      language,
      user: req.user.id
    });

    res.status(201).json(snippet);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// GET ALL SNIPPETS (WITH LANGUAGE FILTER)
export const getSnippets = async (req, res) => {
  try {

    const filter = {};

    if (req.query.language) {
      filter.language = req.query.language;
    }

    const snippets = await Snippet.find(filter).sort({ createdAt: -1 });

    res.status(200).json(snippets);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// GET SINGLE SNIPPET
export const getSnippetById = async (req, res) => {
  try {

    const snippet = await Snippet.findById(req.params.id);

    if (!snippet) {
      return res.status(404).json({ message: "Snippet not found" });
    }

    res.status(200).json(snippet);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// UPDATE SNIPPET
export const updateSnippet = async (req, res) => {
  try {

    const snippet = await Snippet.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!snippet) {
      return res.status(404).json({ message: "Snippet not found" });
    }

    res.status(200).json(snippet);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// DELETE SNIPPET
export const deleteSnippet = async (req, res) => {
  try {

    const snippet = await Snippet.findByIdAndDelete(req.params.id);

    if (!snippet) {
      return res.status(404).json({ message: "Snippet not found" });
    }

    res.status(200).json({ message: "Snippet deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// LIKE / UNLIKE SNIPPET
export const likeSnippet = async (req, res) => {
  try {

    const snippet = await Snippet.findById(req.params.id);

    if (!snippet) {
      return res.status(404).json({ message: "Snippet not found" });
    }

    const userId = req.user.id;

    const alreadyLiked = snippet.likes.includes(userId);

    if (alreadyLiked) {

      snippet.likes = snippet.likes.filter(
        (id) => id.toString() !== userId
      );

    } else {

      snippet.likes.push(userId);

    }

    await snippet.save();

    res.status(200).json(snippet);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ADD REVIEW / COMMENT
export const addReview = async (req, res) => {
  try {

    const snippet = await Snippet.findById(req.params.id);

    if (!snippet) {
      return res.status(404).json({ message: "Snippet not found" });
    }

    const review = {
      user: req.user.id,
      comment: req.body.comment
    };

    snippet.reviews.push(review);

    await snippet.save();

    res.status(201).json(snippet);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET SNIPPETS BY USER
export const getSnippetsByUser = async (req, res) => {
  try {

    const snippets = await Snippet.find({
      user: req.params.id
    }).sort({ createdAt: -1 });

    res.status(200).json(snippets);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};