import express from "express";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Initialize Groq AI
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});


// CODE EXPLANATION ROUTE
router.post("/explain-code", async (req, res) => {
  try {
    const { code, query } = req.body;

    if (!code) {
      return res.status(400).json({
        explanation: "No code provided to explain.",
      });
    }

    const q = (query || "").toLowerCase();

    // 🤖 SMART MODE DETECTION
    let rule = "";

    // LINE BY LINE MODE
    if (q.includes("line by line")) {
      rule = `
You are a senior coding tutor.

Rules:
- Explain EACH line separately
- Mention line number (if possible)
- Explain what each line does in simple words
- Very detailed step-by-step breakdown
- Use bullet points for each line
      `;
    }

    // SHORT MODE
    else if (q.includes("short") || q.includes("brief")) {
      rule = `
You are a coding assistant.

Rules:
- Very short explanation (max 80–100 words)
- Only summary
- No deep details
- Use bullet points
      `;
    }

    // DEEP / A TO Z MODE
    else if (
      q.includes("deep") ||
      q.includes("a to z") ||
      q.includes("full") ||
      q.includes("complete")
    ) {
      rule = `
You are an expert software engineer teacher.

Rules:
- No word limit
- Explain from A to Z in detail
- Include:
  - overall purpose
  - logic flow
  - function breakdown
  - step-by-step explanation
  - edge cases
  - real-world usage
      `;
    }

    // DEFAULT MODE
    else {
      rule = `
You are a helpful coding assistant.

Rules:
- Medium explanation
- Use bullet points
- Include summary + logic
      `;
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: rule,
        },
        {
          role: "user",
          content: `Code:\n${code}\n\nUser request:\n${query}`,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
    });

    const explanation =
      chatCompletion.choices[0]?.message?.content ||
      "AI could not generate explanation.";

    return res.json({ explanation });
  } catch (error) {
    console.error("EXPLAIN ERROR:", error);

    return res.status(500).json({
      explanation: "AI is busy. Try again later.",
    });
  }
});

// CODE GENERATION ROUTE (AUTOMATION)
router.post("/generate-code", async (req, res) => {
  try {
    const { title, language } = req.body;

    if (!title || !language) {
      return res.status(400).json({
        message: "Title and language are required",
      });
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `
You are an expert software engineer AI.

Rules:
- Generate ONLY ${language} code
- Code must match the user requirement
- No explanation text
- No markdown formatting (no triple backticks)
- Clean, production-ready code only
- Add minimal comments inside code
          `,
        },
        {
          role: "user",
          content: `Create ${language} code for: ${title}`,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
    });

    let code =
      chatCompletion.choices[0]?.message?.content ||
      "Could not generate code.";

    // 🧹 CLEANING RESPONSE (VERY IMPORTANT)
    code = code
      .replace(/```[\w]*|```/g, "") // remove markdown backticks
      .trim();

    return res.json({ code });
  } catch (error) {
    console.error("GENERATION ERROR:", error);

    return res.status(500).json({
      message: "AI code generation failed",
    });
  }
});

export default router;