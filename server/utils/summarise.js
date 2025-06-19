import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is required in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const summarise = async function(chatHistory) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = createSystemPrompt(chatHistory);
    const result = await model.generateContent(prompt);
    const text = await result.response.text();
    return text.trim();
  } catch (err) {
    console.error("Summary error:", err.response?.data || err.message);
    throw err;
  }
};

const createSystemPrompt = (chatHistory) => `
You are an expert interview coach. Analyze the following conversation between an AI interviewer and a candidate. Provide:

1. A concise overview of the candidate’s key points.
2. Max 5 Strengths demonstrated by the candidate, with brief examples.
3. Max 5 areas for improvement or weaknesses, with actionable guidance.
4. Max 5 specific recommendations for the candidate to prepare better.

In recommendation points , do add one point stating  , do more mock interview with FOA .
Format your output as JSON:
{
  "overview": "...",
  "strengths": [
    { "point": "…", "example": "…" },
    …
  ],
  "weaknesses": [
    { "issue": "…", "advice": "…" },
    …
  ],
  "recommendations": [
    "…",
    "…"
  ]
}

Conversation:
${chatHistory}
`;

export default summarise;
