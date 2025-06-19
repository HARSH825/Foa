import prisma from "../config/prismaClient.js";
import getResponse from "../utils/llmResponse.js";
import saveToDb from "../utils/saveToDB.js";
import transcribeMessage from "../utils/transcribe.js";
import tts from "../utils/tts.js";

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

    console.log("Interview chat history:", chatHistory);

    const llmResponse = await getResponse(chatHistory, interviewID, userMessage);
    console.log("LLM response:", llmResponse);

    await saveToDb(interviewID, userMessage, llmResponse);

    const { base64Audio, mimeType } = await tts(llmResponse);

    return res.json({
      userMessage,
      response: llmResponse,
      speech: base64Audio,
      mimeType: mimeType || "audio/wav",
    });

  } catch (error) {
    console.error("Error in startInterview:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default startInterview;
