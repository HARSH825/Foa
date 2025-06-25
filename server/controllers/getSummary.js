import prisma from "../config/prismaClient.js";
import summarise from "../utils/summarise.js";
import idealAns from "../utils/getIdealAnswer.js";

const getSummary = async(req , res)=>{
    const interviewId = req.params.interviewId;
    
    try{
        const data = await prisma.interview.findUnique({
            where:{
                id: interviewId,
            },
            include:{
                InterviewChat:{
                    orderBy: { timestamp: 'asc' },
                }
            }
        });

        if (!data || !data.InterviewChat || data.InterviewChat.length === 0) {
            return res.status(404).json({
                error: "No interview data found",
                summary: "No interview data available",
                idealAns: "{}",
                chatHistory: ""
            });
        }

        const chatHistory = data.InterviewChat.map(chat => {
            return `${chat.sender === 'user' ? 'USER' : 'AI'} : ${chat.message}`;
        }).join('\n');
        
        console.log("Chat History for processing:", chatHistory);
        
        const response = await summarise(chatHistory);
        let finalResponse = response.trim().replace(/^```json\s*|\s*```$/g, '');
        
        const idealAnswer = await idealAns(chatHistory, data);
        let idealAnswerFinalResponse = idealAnswer.trim().replace(/^```json\s*|\s*```$/g,'');
        
        console.log("Generated Ideal Answers:", idealAnswerFinalResponse);
        
        return res.json({
            summary: finalResponse, 
            idealAns: idealAnswerFinalResponse, 
            chatHistory: chatHistory
        });

    }
    catch(err){
        console.error("Error generating summary:", err);
        return res.status(500).json({
            error: "Error generating summary",
            summary: "Error generating summary",
            idealAns: "{}",
            chatHistory: ""
        });
    }
}

export default getSummary;