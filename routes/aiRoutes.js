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

    let data = null;

    for (let i = 0; i < 2; i++) {
      try {
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

        // If success, break loop
        if (!data?.error) break;

        console.log("AI retrying... attempt", i + 1, data.error?.message);

        await delay(1000);
      } catch (err) {
        console.log("Fetch error:", err.message);
      }
    }

    // 🚨 SAFE ERROR CHECK
    if (!data || data.error) {
      console.log("AI FAILED RESPONSE:", data);

      return res.status(500).json({
        explanation: "AI is currently busy. Please try again in a few seconds.",
      });
    }

    const explanation =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

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