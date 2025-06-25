import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is required in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const idealAns = async(chatHistory, data) => {
    const model = genAI.getGenerativeModel({model:"gemini-2.0-flash"});
    const prompt = createPrompt(chatHistory, data);
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return text.trim();
}
 
const createPrompt = function(chatHistory, interviewContext) {
    const {
        resumeContent,
        jdContent,
        position,
        type,
        experience,
        specialization,
        company,
        style
    } = interviewContext;

    const prompt = `
You are an expert interview coach. Analyze the following interview conversation and provide ideal answers for ONLY the candidate's responses (USER responses), not the interviewer's questions.

CONVERSATION HISTORY:
${chatHistory}

CONTEXT:
- Resume: ${resumeContent}
- Job Description: ${jdContent}
- Position: ${position}
- Interview Type: ${type}
- Experience Level: ${experience}
- Specialization: ${specialization}
- Company: ${company}
- Style: ${style}

INSTRUCTIONS:
1. Parse the conversation to identify question-answer pairs
2. For each USER response, provide an ideal answer that:
   - Directly addresses the interviewer's question
   - Uses specific examples from the candidate's background
   - Follows the STAR method (Situation, Task, Action, Result) when applicable
   - Is concise but comprehensive (2-3 sentences)
   - Shows relevant skills and experience for the role

3. If the candidate's answer is already excellent, respond with: "Your answer demonstrates good understanding. Well done!"

4. CRITICAL: Only analyze USER responses, ignore AI/interviewer messages when generating ideal answers

Return ONLY a JSON object in this exact format:
{
    "1": { "ideal_answer": "For the question about yourself, highlight your [specific experience] at [company], emphasizing [key achievement] that directly relates to this role..." },
    "2": { "ideal_answer": "When discussing [topic], mention your experience with [specific technology/skill] and provide the example of [specific project/result]..." }
}

Where each number corresponds to the USER's response number in the conversation (1st user response = "1", 2nd user response = "2", etc.)

Make sure the ideal answers are:
- Specific to the role and company
- Professional and confident
- Include quantifiable results when possible
- Address the interviewer's question directly
    `;
    return prompt;
}

export default idealAns;