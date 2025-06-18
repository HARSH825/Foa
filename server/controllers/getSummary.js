import prisma from "../config/prismaClient.js";
import summarise from "../utils/summarise.js";
const getSummary = async(req , res)=>{
    const interviewId = req.params.interviewId;
    // console.log(interviewId);
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

         const chatHistory = data.InterviewChat.map(chat => {
        return `${chat.sender === 'user' ? 'USER' : 'AI'} : ${chat.message}`;
        }).join('\n');

        const response = await summarise(chatHistory);
        let finalResponse =  response.trim().replace(/^```json\s*|\s*```$/g, '');

        return res.json({summary : finalResponse});

    }
    catch(err){
        console.log("Errro generating summary : "+ err);
        return res.json({summary : "error generating summary"});
    }
}
export default getSummary;