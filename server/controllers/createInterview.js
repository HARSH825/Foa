import prisma from "../config/prismaClient.js";
import uplodToCloudinary from "../utils/uploadFile.js";
import downloadAndParseResume from "../utils/downloadParseResume.js";

const createInterview = async (req, res) => {

    console.log("Creating interview...");
    const userId = req.user.id ; 
    const file = req.file;
    const  { buffer , originalname } = file;
    // console.log("File received:", originalname);
    // console.log("Buffer size:", buffer.length);
    const result = await uplodToCloudinary(buffer,originalname);
    if(!result) {
        return res.status(500).json({ message: 'Failed to upload file!' });
    }
    const resumeContent = await downloadAndParseResume(result);
    // console.log("resume contnt  : "+ resumeContent);
    
    //will replace with zod validation later
    const {type , position , experience , specialization, company , style ,duration} = req.body;
    if(!type || !position || !experience || !specialization || !company || !style || !resumeUrl || !duration) {
        return res.status(400).json({ message: 'All fields are required!' });
    }

    try{
        const interview = await prisma.interview.create({
            data:{
                type,
                position,
                experience,
                specialization,
                company,
                style,
                resumeUrl : result,
                duration,
                userId,
                resumeContent 
            }
        });
        const id = interview.id;
        return res.status(201).json({ message: 'Interview created successfully!', interviewId: id });
        
    }
    catch(err) {
        console.error("Error creating interview:", err);
        return res.status(500).json({ message: 'Internal server error!' });
    }
}

export default createInterview;