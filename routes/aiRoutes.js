import express from "express";
import { GoogleGenAI } from "@google/genai";

const router = express.Router();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

router.post("/explain-code", async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        explanation: "Code is required",
      });
    }

    let explanation = null;
    let lastError = null;

    for (let i = 0; i < 2; i++) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: `Explain this code step by step in simple language:\n\n${code}`,
        });

        explanation = response.text;

        if (explanation) break;
      } catch (err) {
        lastError = err;
        console.log("Gemini retrying... attempt", i + 1, err.message);
        await delay(1000);
      }
    }

    if (!explanation) {
      console.log("GEMINI FAILED:", lastError);
      return res.status(500).json({
        explanation: "AI is currently busy. Please try again in a few seconds.",
      });
    }

    return res.json({ explanation });
  } catch (error) {
    console.log("SERVER ERROR:", error);
    return res.status(500).json({
      explanation: "Internal server error. Try again later.",
    });
  }
});

export default router;