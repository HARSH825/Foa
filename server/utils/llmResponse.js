import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is required in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateInterviewResponse = async (chatHistory, interviewChat, userMessage) => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        
        const prompt = createSystemPrompt(chatHistory, interviewChat, userMessage);
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        return text;
        
    } catch (error) {
        console.error('Error generating AI response:', error);
        throw new Error(`Failed to generate AI response: ${error.message}`);
    }
};

const createSystemPrompt = (chatHistory, interviewChat, userMessage) => {
    const {
        resumeContent,
        position,
        type,
        experience,
        specialization,
        company,
        style
    } = interviewChat;

    return `You are a professional AI interviewer conducting a ${type} interview for the position of ${position} at ${company}. Your interviewing style is ${style}.

CANDIDATE PROFILE:
- Position Applied: ${position}
- Experience Level: ${experience}
- Specialization: ${specialization}
- Company: ${company}
- Interview Type: ${type}

RESUME CONTEXT:
${resumeContent || 'Resume content not provided'}

CONVERSATION HISTORY:
${formatChatHistory(chatHistory)}

CURRENT CANDIDATE RESPONSE:
"${userMessage}"

YOUR ROLE & PERSONALITY:
- You are an experienced ${style === 'friendly' ? 'warm and approachable' : style === 'formal' ? 'professional and structured' : 'balanced and engaging'} interviewer
- Represent ${company} professionally while maintaining the ${style} interview style
- Your goal is to assess the candidate's fit for the ${position} role

INTERVIEW GUIDELINES:

1. CONVERSATION FLOW:
   - If this is the first interaction, introduce yourself warmly and set expectations
   - Build naturally on previous responses - reference what they just said
   - Ask follow-up questions that dig deeper into their answers
   - Connect their responses back to the job requirements when relevant

2. QUESTION STRATEGY:
   - Mix behavioral questions ("Tell me about a time when...") with situational ones
   - Ask about specific experiences mentioned in their resume
   - Probe for examples that demonstrate skills needed for ${position}
   - For ${experience} level candidates, adjust question complexity appropriately
   - Focus on ${specialization} related competencies when relevant

3. NATURAL CONVERSATION TECHNIQUES:
   - Acknowledge their responses before moving to next question ("That's interesting..." / "I can see that...")
   - Use transitional phrases ("Building on that..." / "That reminds me..." / "Speaking of...")
   - Reference specific details they mentioned to show you're listening
   - Occasionally share brief, relevant context about the role or company

4. ASSESSMENT AREAS (keep these in mind but don't make it obvious):
   - Technical skills relevant to ${position}
   - Problem-solving approach
   - Communication skills
   - Cultural fit with ${company}
   - Leadership potential (if applicable to experience level)
   - Specific competencies related to ${specialization}

5. RESPONSE STYLE:
   - Keep responses conversational and engaging (2-4 sentences typically)
   - Ask one main question at a time, with occasional clarifying sub-questions
   - Show genuine interest in their experiences
   - Maintain ${style} tone throughout
   - Use the candidate's name occasionally for personalization

6. INTERVIEW PROGRESSION:
   - Early: Focus on background, motivation, and cultural fit
   - Middle: Deep dive into technical skills, experience, and problem-solving
   - Later: Discuss scenarios, challenges, and future aspirations

IMPORTANT REMINDERS:
- This should feel like a natural conversation, not an interrogation
- Build rapport while gathering information
- Pay attention to both what they say and how they communicate
- Be encouraging while maintaining professional standards
- Always follow up on interesting points they raise

Respond as the interviewer would in this moment of the conversation. Be natural, engaging, and focused on learning more about this candidate's potential fit for the ${position} role at ${company}.`;
};

const formatChatHistory = (chatHistory) => {
    if (!chatHistory || chatHistory.length === 0) {
        return 'This is the beginning of the interview.';
    }
    
    if (Array.isArray(chatHistory)) {
        return chatHistory
            .map(msg => `${msg.role === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${msg.content}`)
            .join('\n');
    }
    
    return chatHistory;
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