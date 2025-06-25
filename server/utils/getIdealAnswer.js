import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is required in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const idealAns = async(chatHistory, data) => {
    try {
        const model = genAI.getGenerativeModel({model:"gemini-2.0-flash"});
        const prompt = createPrompt(chatHistory, data);
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return text.trim();
    } catch (error) {
        console.error("Error generating ideal answers:", error);
        return JSON.stringify({
            "1": { "ideal_answer": "Error generating ideal answer. Please try again later." }
        });
    }
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

    const lines = chatHistory.split('\n').filter(line => line.trim());
    let questionAnswerPairs = [];
    let currentQuestion = "";
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line.startsWith('AI :')) {
            currentQuestion = line.replace('AI :', '').trim();
        } else if (line.startsWith('USER :') && currentQuestion) {
            const userAnswer = line.replace('USER :', '').trim(); 
            questionAnswerPairs.push({
                question: currentQuestion,
                answer: userAnswer
            });
            currentQuestion = ""; 
        }
    }

    const prompt = `
You are an expert interview coach. Analyze the following interview conversation and provide ideal answers for each candidate response.

CONVERSATION ANALYSIS:
The conversation contains ${questionAnswerPairs.length} question-answer pairs:

${questionAnswerPairs.map((pair, index) => 
    `Q${index + 1}: ${pair.question}\nCandidate's A${index + 1}: ${pair.answer}\n`
).join('\n')}

CONTEXT:
- Resume: ${resumeContent || 'Not provided'}
- Job Description: ${jdContent || 'Not provided'}
- Position: ${position || 'Not specified'}
- Interview Type: ${type || 'General'}
- Experience Level: ${experience || 'Not specified'}
- Specialization: ${specialization || 'Not specified'}
- Company: ${company || 'Not specified'}
- Style: ${style || 'Professional'}

INSTRUCTIONS:
For each candidate response above, provide an ideal answer that:

1. **Directly addresses the interviewer's specific question**
2. **Uses the STAR method** (Situation, Task, Action, Result) when telling stories
3. **Incorporates relevant details** from the candidate's resume and experience
4. **Aligns with the job requirements** mentioned in the job description
5. **Is professional, confident, and concise** (2-4 sentences typically)
6. **Includes specific examples and quantifiable results** when possible
7. **Shows enthusiasm for the role and company**

CRITICAL REQUIREMENTS:
- Generate exactly ${questionAnswerPairs.length} ideal answers
- Each ideal answer should correspond to the candidate's response to that specific question
- If a candidate's answer is already excellent, acknowledge it but still provide enhancement suggestions
- Focus on what makes each answer better, not just different

Return ONLY a JSON object in this exact format:
{
    "1": { "ideal_answer": "[Enhanced answer for the first candidate response that directly addresses: '${questionAnswerPairs[0]?.question || 'Question not found'}']" },
    "2": { "ideal_answer": "[Enhanced answer for the second candidate response that directly addresses: '${questionAnswerPairs[1]?.question || 'Question not found'}']" }${questionAnswerPairs.length > 2 ? ',\n    ...' : ''}
}

Make sure each ideal answer:
- Starts by directly addressing the specific question asked
- Provides concrete examples from relevant experience
- Ends with a connection to why this makes them suitable for the role
- Is tailored to the ${position || 'target position'} at ${company || 'the company'}

EXAMPLE FORMAT FOR RESPONSES:
"To answer your question about [specific topic from question], I have [specific experience/skill]. For example, at [company/project], I [specific action taken] which resulted in [quantifiable outcome]. This experience directly prepares me for [specific aspect of the target role] because [clear connection]."
`;

    return prompt;
}

export default idealAns;