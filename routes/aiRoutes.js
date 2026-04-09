import express from "express";

const router = express.Router();

router.post("/explain-code", async (req, res) => {
  try {
    const { code } = req.body;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_GEMINI_API_KEY`,
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

    const data = await response.json();

    const explanation =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    res.json({ explanation });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "AI request failed" });
  }
});

export default router;