import express from "express";

const router = express.Router();

router.post("/explain-code", async (req, res) => {
    try {
        const { code } = req.body;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
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

        console.log("FULL GEMINI RESPONSE:", JSON.stringify(data, null, 2));

        let explanation = "";

        if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            explanation = data.candidates[0].content.parts[0].text;
        } else if (data?.error) {
            explanation = data.error.message;
        } else {
            explanation = "No AI response. Check API key or quota.";
        }

        res.json({ explanation });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            explanation: "Server error while generating AI response"
        });
    }
});

export default router;