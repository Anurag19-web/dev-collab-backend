import express from "express";
import OpenAI from "openai";

const router = express.Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/explain-code", async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ explanation: "Code is required" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Explain this code step by step in simple language:\n\n${code}`,
        },
      ],
    });

    const explanation = completion?.choices?.[0]?.message?.content;

    if (!explanation) {
      console.log("FULL OPENAI RESPONSE:", completion);
      return res.status(500).json({
        explanation: "No explanation generated. Try again.",
      });
    }

    return res.json({ explanation });
  } catch (error) {
    console.log("OPENAI ERROR:", error);
    return res.status(500).json({
      explanation: error.message || "Internal server error",
    });
  }
});

export default router;