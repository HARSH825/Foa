import prisma from "../config/prismaClient.js";
import getResponse from "../utils/llmResponse.js";
import saveToDb from "../utils/saveToDB.js";

const startInterview = async (req, res) => {
  const interviewID = req.params.interviewId;
  const userMessage = req.body.message;
    console.log("usr msg : "+userMessage);
  if (!interviewID || !userMessage) {
    return res.status(400).json({ message: 'Interview ID and message are required!' });
  }

  try {
    const interviewChat = await prisma.interview.findUnique({
      where: { id: interviewID },
      include: {
        InterviewChat: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    if (!interviewChat) {
      return res.status(404).json({ message: 'Interview not found!' });
    }

    const chatHistory = interviewChat.InterviewChat.map(chat => {
      return `${chat.sender === 'user' ? 'USER' : 'AI'} : ${chat.message}`;
    }).join('\n');
    // console.log(chatHistory);

    

    const llmResponse = await getResponse(chatHistory, interviewChat,userMessage);
    console.log("llm resp : "+llmResponse);
    await saveToDb(interviewID, userMessage, llmResponse);

    return res.json({ response: llmResponse });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export default startInterview;

