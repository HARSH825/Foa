import prisma from "../config/prismaClient.js";

const saveToDb= async (interviewId,userMessage , llmResponse) => {
    try{
        const result = await prisma.interviewChat.createMany({
            data:[
                {interviewId:interviewId, sender:'user', message:userMessage},
                {interviewId:interviewId,sender:'ai',message:llmResponse}
            ]
        })
    }
    catch(err) {
        console.error("Error saving to database:", err);
        throw new Error('Failed to save chat messages to the database');
    }
} 
export default saveToDb;