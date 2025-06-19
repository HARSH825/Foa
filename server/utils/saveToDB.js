import prisma from "../config/prismaClient.js";

const saveToDb = async (interviewId, userMessage, llmResponse) => {
    try {
        if (userMessage && llmResponse) {
            await prisma.interviewChat.createMany({
                data: [
                    { interviewId: interviewId, sender: 'user', message: userMessage },
                    { interviewId: interviewId, sender: 'ai', message: llmResponse }
                ]
            });
        } else if (userMessage) {
            await prisma.interviewChat.create({
                data: { interviewId: interviewId, sender: 'user', message: userMessage }
            });
        } else if (llmResponse) {
            await prisma.interviewChat.create({
                data: { interviewId: interviewId, sender: 'ai', message: llmResponse }
            });
        }
    } catch (err) {
        console.error("Error saving to database:", err);
        throw new Error('Failed to save chat messages to the database');
    }
};

const saveUserMessageAsync = async (interviewId, userMessage) => {
    try {
        return prisma.interviewChat.create({
            data: { interviewId: interviewId, sender: 'user', message: userMessage }
        });
    } catch (err) {
        console.error("Error saving user message:", err);
        throw new Error('Failed to save user message to database');
    }
};

const saveAiMessageAsync = async (interviewId, llmResponse) => {
    try {
        return prisma.interviewChat.create({
            data: { interviewId: interviewId, sender: 'ai', message: llmResponse }
        });
    } catch (err) {
        console.error("Error saving AI message:", err);
        throw new Error('Failed to save AI message to database');
    }
};

export { saveUserMessageAsync, saveAiMessageAsync };
export default saveToDb;