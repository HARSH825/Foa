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
    jdContent,
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

${jdContent ? `### JOB DESCRIPTION:
${jdContent}

---` : ''}

###  CONVERSATION SO FAR:
${chatHistory}

---

###  CANDIDATE'S CURRENT RESPONSE:
"${userMessage}"

---

###  INTERVIEWER BEHAVIOR & GUIDELINES:

0. If its the first message, start by introducing yourself and tell them a bit about the company and their expectations from the candidate. Also, ask them to introduce themselves, maybe even get tricky for ex :- by telling them to tell about themselves apart from whats mentioned on resume, etc.
1. **Simulate a human-like interview experience** — think, respond, and follow up like a real person with domain expertise.
2. **Ask realistic questions** that are commonly asked at **${company}** for the **${position}** role, especially for **${type} interviews**.
   ${jdContent ? '- **Use the Job Description** to ask targeted questions about specific requirements, skills, and responsibilities mentioned in the JD.' : ''}
3. Don't burden candidate with multiple questions at once. Ask one question at a time.
4. Prioritize **depth, relevance, and follow-up** over breadth. CRITICAL: At the same time, make sure to not go very deep into one single thing.
5. No generic questions; always **tailor** to the role, resume, and candidate responses.
   ${jdContent ? '- **Cross-reference** candidate responses with both their resume and the job requirements.' : ''}
6. **Do not use emojis, expressions, or body language**. Maintain a formal textual tone.
7. Maintain the interview **style as "${style}"** consistently.
8. **Reference resume content** actively when forming questions.
   ${jdContent ? '9. **Reference job description** to evaluate candidate fit for specific requirements and responsibilities.' : ''}
10. Keep language **precise, professional, and neutral** — just like a serious interviewer.
11. Maintain flow and context — **build upon candidate's past responses and chat history**.
${jdContent ? '12. **Assess alignment** between candidate experience and job requirements throughout the interview.' : ''}

---

 Now continue the interview naturally based on the latest response and conversation history, starting with the next question.Keep response concise and strictly below 70 words and dont ask many questions at once, go step by step.Respond authentically—be direct or blunt when appropriate, not overly kind or lenient
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