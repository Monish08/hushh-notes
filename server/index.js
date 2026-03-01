const express = require("express");
const cors = require("cors");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const axios = require("axios");
require("dotenv").config();

const app = express();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

app.use(cors({
    origin: "*",
  }));
app.use(express.json());

const QUIZ_PROMPT = `
You are Kai, an AI-powered campus exam assistant for Indian college students.

Transform the study material provided into a structured exam prep package.

Return ONLY this JSON (no markdown, no explanation, no code blocks, raw JSON only):
{
  "summary": "Concise exam-focused summary (200-300 words)",
  "mostRepeatedConcepts": ["Concept 1","Concept 2","Concept 3","Concept 4","Concept 5"],
  "likelyExamQuestions": ["Question 1","Question 2","Question 3","Question 4","Question 5"],
  "questions": [
    {
      "type": "mcq",
      "question": "Question text",
      "options": ["Option A","Option B","Option C","Option D"],
      "answer": "Option A",
      "difficulty": "easy"
    }
  ]
}

STRICT RULES:
- Exactly 20 questions total: 12 MCQs + 8 short answers
- Difficulty: 8 easy, 8 medium, 4 hard
- MCQ answer must exactly match one of the 4 options
- Short answer questions: type is "short", no options field, answer is brief text
- No duplicate questions
- Return ONLY raw JSON, nothing else
`;

const parseJSON = (text) => {
  const cleaned = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  return JSON.parse(cleaned);
};

const callMistral = async (userMessage) => {
  const response = await axios.post(
    "https://api.mistral.ai/v1/chat/completions",
    {
      model: "mistral-small-latest",
      messages: [
        {
          role: "user",
          content: userMessage,
        },
      ],
      temperature: 0.3,
      max_tokens: 4096,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data.choices[0].message.content;
};

app.post("/generate-quiz", upload.single("file"), async (req, res) => {
  try {
    console.log("📥 Request received");
    console.log("   File:", req.file ? `${req.file.originalname} (${req.file.size} bytes)` : "MISSING");

    if (!req.file) {
      return res.status(400).json({ error: "No file received by server." });
    }

    // Extract text from PDF
    let extractedText = "";
    try {
      const pdfData = await pdfParse(req.file.buffer);
      extractedText = (pdfData.text || "").trim();
      console.log(`📄 Extracted text length: ${extractedText.length} chars`);
    } catch (e) {
      console.log("⚠️ pdf-parse failed:", e.message);
    }

    if (extractedText.length < 100) {
      return res.status(400).json({
        error: "Could not extract text from PDF. Please use a digital (non-scanned) PDF.",
      });
    }

    console.log("✅ Calling Mistral AI...");
    const userMessage = `${QUIZ_PROMPT}\n\nSTUDY MATERIAL:\n${extractedText.slice(0, 12000)}`;
    const responseText = await callMistral(userMessage);

    console.log("🤖 Mistral responded, parsing JSON...");
    const parsed = parseJSON(responseText);
    const questions = parsed.questions || [];

    if (!questions.length) {
      return res.status(500).json({ error: "AI returned no questions. Try again." });
    }

    console.log(`✅ Generated ${questions.length} questions`);

    res.json({
      summary: parsed.summary || "",
      mostRepeatedConcepts: parsed.mostRepeatedConcepts || [],
      likelyExamQuestions: parsed.likelyExamQuestions || [],
      questions,
    });
  } catch (err) {
    console.error("❌ Error:", err.response?.data || err.message);

    if (err.response?.status === 401) {
      return res.status(500).json({ error: "Invalid Mistral API key. Check your .env file." });
    }
    if (err.response?.status === 429) {
      return res.status(500).json({ error: "Mistral rate limit hit. Wait a moment and try again." });
    }
    if (err.message?.includes("JSON") || err instanceof SyntaxError) {
      return res.status(500).json({ error: "AI returned malformed JSON. Please try again." });
    }

    res.status(500).json({ error: "Failed: " + err.message });
  }
});

app.get("/health", (req, res) => {
  res.json({
    status: "✅ Kai Notes backend running",
    mistralKey: !!process.env.MISTRAL_API_KEY,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔑 Mistral API key: ${process.env.MISTRAL_API_KEY ? "✅ loaded" : "❌ MISSING"}`);

});
