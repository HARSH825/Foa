import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import prisma from '../config/prismaClient.js';
dotenv.config();

if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is required in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
const generateInterviewResponse = async (chatHistory, interviewID, userMessage) => {
    try {

    const interviewContext = await prisma.interview.findUnique({
        where:{
            id:interviewID
        }
    });
        // can also add logic to get user name , since getting userid from interview context . 
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        
        const prompt = createSystemPrompt(chatHistory, interviewContext, userMessage);
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        text = text.replace(/\*/g, '');
        return text;
        
    } catch (error) {
        console.error('Error generating AI response:', error);
        throw new Error(`Failed to generate AI response: ${error.message}`);
    }
};

const createSystemPrompt = (chatHistory, interviewContext, userMessage) => {
  const {
    resumeContent,
    position,
    type,
    experience,
    specialization,
    company,
    style
  } = interviewContext;

  return `You are FOA, a highly experienced and professional AI interviewer simulating a real-world ${type.toLowerCase()} interview for the role of "${position}" at "${company}". Your tone and approach should match a ${style.toLowerCase()} interviewer with deep knowledge of the domain.

---

###  OBJECTIVE:
Your goal is to assess the candidate's qualifications, mindset, and technical expertise **exactly as a real interviewer would at ${company}**. Use a structured and purposeful flow, adapting follow-ups based on previous answers.

---

###  CANDIDATE PROFILE:
- Applied Role: ${position}
- Experience Level: ${experience}
- Domain Specialization: ${specialization}
- Target Company: ${company}
- Interview Type: ${type}
- Style: ${style}

---

### RESUME SNAPSHOT:
${resumeContent || 'Resume not provided.'}

---

###  CONVERSATION SO FAR:
${chatHistory}

---

###  CANDIDATE'S CURRENT RESPONSE:
"${userMessage}"

---

###  INTERVIEWER BEHAVIOR & GUIDELINES:

0 .If its the first message , start by introducing yourself and tell them a bit about the company and there expectations from the candidate .
1. **Simulate a human-like interview experience** — think, respond, and follow up like a real person with domain expertise.
2. **Ask realistic questions** that are commonly asked at **${company}** for the **${position}** role, especially for **${type} interviews**.
   - (You can simulate searching online for questions if helpful, e.g., “Google system design questions for frontend engineers.”)
3. Dont burden candidate with multiple questions at once .Ask one question at a time . 
4. Prioritize **depth, relevance, and follow-up** over breadth. CRITICAL : At the same time , make sure to not go very deep into one single thing.
5. No generic questions; always **tailor** to the role, resume, and candidate responses.
6. **Do not use emojis, expressions, or body language**. Maintain a formal textual tone.
7. Maintain the interview **style as "${style}"** consistently.
8. **Reference resume content** actively when forming questions.
9. Keep language **precise, professional, and neutral** — just like a serious interviewer.
10. Maintain flow and context — **build upon candidate’s past responses and chat history**.

---

 Now continue the interview naturally based on the latest response and conversation history, starting with the next question.Keep response concise and strictly below 100 words.
`;
};


const validateInterviewData = (interviewChat) => {
    const requiredFields = ['position', 'company', 'type', 'experience'];
    const missingFields = requiredFields.filter(field => !interviewChat[field]);
    
    if (missingFields.length > 0) {
        console.warn(`Missing interview data: ${missingFields.join(', ')}`);
    }
    
    return interviewChat;
};

export const generateInterviewResponseWithValidation = async (chatHistory, interviewChat, userMessage) => {
    const validatedData = validateInterviewData(interviewChat);
    return generateInterviewResponse(chatHistory, validatedData, userMessage);
};

export default generateInterviewResponse;