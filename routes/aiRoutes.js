import express from "express";
import OpenAI from "openai";  // Add this import

const router = express.Router();
const openai = new OpenAI();  // Initializes with process.env.OPENAI_API_KEY

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

router.post("/explain-code", async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        explanation: "Code is required",
      });
    }

    let data = null;

    for (let i = 0; i < 2; i++) {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: `Explain this code step by step in simple language:\n\n${code}`,
            },
          ],
        });

        data = completion.toDict();  // Convert to plain object for checks

        // If success, break loop
        if (!data.error) break;

        console.log("AI retrying... attempt", i + 1, data.error?.message);
        await delay(1000);
      } catch (err) {
        console.log("AI error:", err.message);
      }
    }

    // 🚨 SAFE ERROR CHECK
    if (!data || data.error) {
      console.log("AI FAILED RESPONSE:", data);
      return res.status(500).json({
        explanation: "AI is currently busy. Please try again in a few seconds.",
      });
    }

    const explanation = data.choices?.[0]?.message?.content;

    if (!explanation) {
      return res.status(500).json({
        explanation: "No explanation generated. Try again.",
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