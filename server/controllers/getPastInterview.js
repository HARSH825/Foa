import prisma from "../config/prismaClient.js";

export const getPastInterview = async (req, res) => {
  try {
    const userId = req.user.id; 

    const userWithInterviews = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        interviews: {
          where: {
            InterviewChat: {
              some: {} 
            }
          },
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            id: true,
            type: true,
            position: true,
            experience: true,
            specialization: true,
            company: true,
            style: true,
            duration: true,
            createdAt: true,
            InterviewChat: {
              select: {
                id: true
              }
            }
          }
        }
      }
    });

    return res.status(200).json({ interviews: userWithInterviews.interviews });

  } catch (error) {
    console.error("Error fetching past interviews:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
