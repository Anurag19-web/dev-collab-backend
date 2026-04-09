import express from "express";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Initialize Groq with your API Key
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

router.post("/explain-code", async (req, res) => {
  try {
    const { code, query } = req.body;

    // Validation
    if (!code) {
      return res.status(400).json({ explanation: "No code provided to explain." });
    }

    // If the user didn't type a specific question, use a default prompt
    const userPrompt = query && query.trim() !== "" 
      ? query 
      : "Explain this code briefly for a developer.";

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a professional AI coding assistant. 
          Your goal is to provide high-value, concise insights.
          
          Strict Rules:
          1. Keep the total response under 80 words.
          2. Use clear bullet points.
          3. If the user asks a specific question, answer it directly.
          4. If it's a general explanation, provide: 
             - A 1-sentence summary.
             - 2 key logic points.
             - 1 'Pro-Tip' or 'Warning'.`
        },
        {
          role: "user",
          content: `Code Context:\n${code}\n\nUser Question: ${userPrompt}`,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5, // Keeps responses focused and less "creative"
    });

    const explanation = chatCompletion.choices[0]?.message?.content || "AI could not generate an explanation.";

    // Send the response back to the frontend
    return res.json({ explanation });

  } catch (error) {
    console.error("GROQ API ERROR:", error);
    
    // Handle specific Groq errors (like rate limits)
    return res.status(500).json({
      explanation: "The AI is currently busy. Please try again in a moment.",
    });
  }
});

export default router;