import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is required in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const idealAns = async(chatHistory,data)=>{
    const model = genAI.getGenerativeModel({model:"gemini-2.0-flash"});
    const prompt = createPrompt(chatHistory,data);
    const result = await model.generateContent(prompt);
    const text =  result.response.text();
     return text.trim();
}

const createPrompt = function(chatHistory, interviewContext) {
    
    const {
        resumeContent ,
        jdContent,
        position,
        type,
        experience,
        specialization,
        company,
        style
    } = interviewContext;

    const prompt = `
Assume you are a coach evaluating a candidate's interview answers. Here is the conversation history: ${chatHistory}

Your task is to review each answer. If an answer is not ideal or is ambiguous, provide the most ideal answer in simple, clear vocabulary. If the answer is already ideal, respond with: "Well done, answer is already up to the mark."

Return your response as a JSON object, for example:
{
    "1": { "ideal_answer": "..." },
    "2": { "ideal_answer": "..." }
}
where each key corresponds to a conversation turn.

Use the following details to help you craft better answers:
- Resume details: ${resumeContent}
- Job description: ${jdContent}
- Position: ${position}
- Interview type: ${type}
- Experience: ${experience}
- Specialization: ${specialization}
- Company: ${company}
- Preferred style: ${style}

Make sure your answers are concise , easy to understand, and tailored to the context above.
    `;
    return prompt;
}

export default idealAns;