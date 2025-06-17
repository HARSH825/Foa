import prisma from "../config/prismaClient.js";
import getResponse from "../utils/llmResponse.js";
import saveToDb from "../utils/saveToDB.js";
import transcribeMessage from "../utils/transcribe.js";

const startInterview = async (req, res) => {
  const interviewID = req.params.interviewId;
  const userFile = req.file;
    if (!userFile) {
    return res.status(404).json({ msg: "audio file not found" });
  }
  const userMessage = await transcribeMessage(userFile);
  console.log("User message trranscrbed : "+ userMessage);
  if (!interviewID || !userMessage) {
    return res.status(400).json({ message: 'Interview ID and message are required!' });
  }

  try {
    const chats = await prisma.interview.findUnique({
      where: { id: interviewID },
      include: {
        InterviewChat: {
          take: 30,
          orderBy: { timestamp: 'desc' },
        },
      },
    });
    const interviewChat = chats.InterviewChat.reverse();
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

    //convert llm response to speech here , and pass to the frontend .
    return res.json({ response: llmResponse });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export default startInterview;

