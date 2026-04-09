import express from "express";

const router = express.Router();

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

router.post("/explain-code", async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        explanation: "Code is required",
      });
    }

    let data;

    for (let i = 0; i < 2; i++) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Explain this code step by step in simple language:\n\n${code}`,
                  },
                ],
              },
            ],
          }),
        }
      );

      data = await response.json();

      // if no error, stop retrying
      if (!data.error) break;

      console.log("AI retrying... attempt", i + 1);
      await delay(1000);
    }

    const explanation =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!explanation) {
      return res.status(500).json({
        explanation: "AI could not generate response. Try again.",
      });
    }

    res.json({ explanation });
  } catch (error) {
    console.log("AI ERROR:", error);

    res.status(500).json({
      explanation: "AI request failed",
    });
  }
});

export default router;