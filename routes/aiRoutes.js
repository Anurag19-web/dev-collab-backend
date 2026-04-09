import express from "express";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Initialize Groq AI
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});


// ===============================
// 🤖 1. CODE EXPLANATION ROUTE
// ===============================
router.post("/explain-code", async (req, res) => {
  try {
    const { code, query } = req.body;

    if (!code) {
      return res.status(400).json({
        explanation: "No code provided to explain.",
      });
    }

    const userPrompt =
      query && query.trim() !== ""
        ? query
        : "Explain this code briefly for a developer.";

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `
You are a professional AI coding assistant.

Rules:
- Keep response under 80 words
- Use bullet points
- Include: summary + key points + pro tip
          `,
        },
        {
          role: "user",
          content: `Code:\n${code}\n\nQuestion: ${userPrompt}`,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
    });

    const explanation =
      chatCompletion.choices[0]?.message?.content ||
      "AI could not generate explanation.";

    return res.json({ explanation });
  } catch (error) {
    console.error("EXPLAIN ERROR:", error);

    return res.status(500).json({
      explanation: "AI is busy. Try again later.",
    });
  }
});


// ===============================
// 🚀 2. CODE GENERATION ROUTE (AUTOMATION)
// ===============================
router.post("/generate-code", async (req, res) => {
  try {
    const { title, language } = req.body;

    if (!title || !language) {
      return res.status(400).json({
        message: "Title and language are required",
      });
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `
You are an expert software engineer AI.

Rules:
- Generate ONLY ${language} code
- Code must match the user requirement
- No explanation text
- No markdown formatting (no triple backticks)
- Clean, production-ready code only
- Add minimal comments inside code
          `,
        },
        {
          role: "user",
          content: `Create ${language} code for: ${title}`,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
    });

    let code =
      chatCompletion.choices[0]?.message?.content ||
      "Could not generate code.";

    // 🧹 CLEANING RESPONSE (VERY IMPORTANT)
    code = code
      .replace(/```[\w]*|```/g, "") // remove markdown backticks
      .trim();

    return res.json({ code });
  } catch (error) {
    console.error("GENERATION ERROR:", error);

    return res.status(500).json({
      message: "AI code generation failed",
    });
  }
});

export default router;