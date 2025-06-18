import prisma from "../config/prismaClient.js";
import getResponse from "../utils/llmResponse.js";
import saveToDb from "../utils/saveToDB.js";
import transcribeMessage from "../utils/transcribe.js";

const startInterview = async (req, res) => {
  const interviewID = req.params.interviewId;
  const userFile = req.file;

  if (!userFile) {
    return res.status(404).json({ msg: "Audio file not found" });
  }

  const userMessage = await transcribeMessage(userFile);
  console.log("User message transcribed:", userMessage);

  if (!interviewID || !userMessage) {
    return res.status(400).json({ message: "Interview ID and message are required!" });
  }

  try {
    const chats = await prisma.interview.findUnique({
      where: { id: interviewID },
      include: {
        InterviewChat: {
          take: 30,
          orderBy: { timestamp: "desc" },
        },
      },
    });

    if (!chats) {
      return res.status(404).json({ message: "Interview not found!" });
    }

    const interviewChat = chats.InterviewChat?.reverse() || [];

    const chatHistory = interviewChat
      .map(chat => `${chat.sender === "user" ? "USER" : "AI"} : ${chat.message}`)
      .join("\n");

    const llmResponse = await getResponse(chatHistory, interviewChat, userMessage);
    console.log("LLM response:", llmResponse);

    await saveToDb(interviewID, userMessage, llmResponse);

    // Optionally: Add TTS logic here to convert `llmResponse` to audio

    return res.json({ response: llmResponse , userMessage:userMessage});
  } catch (error) {
    console.error("Error in startInterview:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default startInterview;
