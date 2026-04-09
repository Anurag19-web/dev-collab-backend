import express from "express";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Initialize Groq AI
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});


// ===============================
// 🤖 CODE EXPLANATION ROUTE
// ===============================
router.post("/explain-code", async (req, res) => {
  try {
    const { code, query } = req.body;

    if (!code || code.trim() === "") {
      return res.status(400).json({
        explanation: "No code provided to explain.",
      });
    }

    const q = (query || "").toLowerCase();

    let rule = "";

    // ===============================
    // 📌 LINE BY LINE MODE
    // ===============================
    if (q.includes("line by line")) {
      rule = `
You are an expert coding tutor.

OUTPUT FORMAT:

📌 CODE EXPLANATION (LINE BY LINE)

🔹 Line 1:
Explain what this line does in simple words.

🔹 Line 2:
Explain what this line does in simple words.

(continue for all lines in same format)

📌 FINAL SUMMARY:
- Key point 1
- Key point 2

RULES:
- Use emojis and headings
- Be very clear and beginner friendly
- Strictly follow format
      `;
    }

    // ===============================
    // 📌 SHORT MODE
    // ===============================
    else if (q.includes("short") || q.includes("brief")) {
      rule = `
You are a coding assistant.

OUTPUT FORMAT:

📌 SHORT EXPLANATION

🔹 Summary:
- Only main idea in 4–6 bullet points
- No deep explanation

RULES:
- Keep it very short and simple
- No line-by-line explanation
      `;
    }

    // ===============================
    // 📌 DEEP MODE (A → Z)
    // ===============================
    else if (
      q.includes("deep") ||
      q.includes("a to z") ||
      q.includes("full") ||
      q.includes("complete")
    ) {
      rule = `
You are an expert software engineering teacher.

OUTPUT FORMAT:

📌 COMPLETE CODE EXPLANATION (A → Z)

🔹 Overview:
Explain full purpose of code

🔹 Logic Flow:
Step-by-step working

🔹 Detailed Breakdown:
Explain important parts in depth

🔹 Edge Cases:
Mention possible issues

🔹 Real World Use:
Where this code is used

📌 FINAL SUMMARY:
- Key learning points

RULES:
- Very detailed explanation
- Use emojis and headings
- Strict formatting required
      `;
    }

    // ===============================
    // 📌 DEFAULT MODE
    // ===============================
    else {
      rule = `
You are a helpful coding assistant.

OUTPUT FORMAT:

📌 CODE EXPLANATION

🔹 Summary:
- Medium level explanation
- Key points only

RULES:
- Clean and simple
- Use bullet points
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
          content: `Code:\n${code}\n\nUser Request:\n${query}`,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.4,
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


// ===============================
// ⚡ CODE GENERATION ROUTE
// ===============================
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
- No explanation
- No markdown (no backticks)
- Clean production-ready code only
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

    // 🧹 CLEAN OUTPUT
    code = code
      .replace(/```[\w]*|```/g, "")
      .replace(/^\s*\n/gm, "")
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