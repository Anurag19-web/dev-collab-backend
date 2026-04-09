import express from "express";
import Groq from "groq-sdk"; // 1. Use the Groq SDK

const router = express.Router();

// 2. Initialize Groq with your API Key from .env
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

router.post("/explain-code", async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        explanation: "Code is required",
      });
    }

    // 3. Call Groq (Fastest path)
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that explains code step by step in simple language.",
        },
        {
          role: "user",
          content: `Explain this code:\n\n${code}`,
        },
      ],
      // Llama 3.3 70B is smart and extremely fast on Groq
      model: "llama-3.3-70b-versatile", 
    });

    const explanation = chatCompletion.choices[0]?.message?.content;

    if (!explanation) {
      throw new Error("Empty response from AI");
    }

    return res.json({ explanation });

  } catch (error) {
    console.error("GROQ/SERVER ERROR:", error);

    // Specific handling for common errors
    if (error.status === 401) {
       return res.status(401).json({ explanation: "Invalid API Key. Check your .env file." });
    }

    return res.status(500).json({
      explanation: "AI is currently unavailable. Try again in a moment.",
    });
  }
});

export default router;