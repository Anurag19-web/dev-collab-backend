import express from "express";
import Groq from "groq-sdk";

const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

router.post("/explain-code", async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ explanation: "Code is required" });
    }

    // THIS IS THE PART YOU ARE ADDING/UPDATING
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a technical code reviewer. 
          Keep explanations extremely concise and under 100 words. 
          Use this format:
          1. Simple summary (1 sentence).
          2. Main logic (2-3 bullet points).
          3. One 'Pro-Tip' or Warning.`
        },
        {
          role: "user",
          content: `Explain this code briefly:\n\n${code}`,
        },
      ],
      model: "llama-3.3-70b-versatile", 
    });

    const explanation = chatCompletion.choices[0]?.message?.content;

    return res.json({ explanation });

  } catch (error) {
    console.error("GROQ ERROR:", error);
    return res.status(500).json({
      explanation: "AI is currently resting. Try again in a bit.",
    });
  }
});

export default router;