import prisma from "../config/prismaClient.js";
import uplodToCloudinary from "../utils/uploadFile.js";
import downloadAndParseResume from "../utils/downloadParseResume.js";
import parseJD from "../utils/parseJD.js";

const createInterview = async (req, res) => {
    console.log("Creating interview...");
    const userId = req.user.id;
    const files = req.files;
    
    const resumeFile = files?.resume?.[0];
    if (!resumeFile) {
        return res.status(400).json({ message: 'Resume file is required!' });
    }
    
    const { buffer: resumeBuffer, originalname: resumeOriginalName } = resumeFile;
    
    const jdFile = files?.jd?.[0];
    let jdBuffer = null;
    let jdOriginalName = null;
    
    if (jdFile) {
        jdBuffer = jdFile.buffer;
        jdOriginalName = jdFile.originalname;
        console.log("JD file received:", jdOriginalName);
    }
    
    const { jdText } = req.body;
    
    try {
        const resumeResult = await uplodToCloudinary(resumeBuffer, resumeOriginalName);
        if (!resumeResult) {
            return res.status(500).json({ message: 'Failed to upload resume file!' });
        }
        
        const resumeContent = await downloadAndParseResume(resumeResult);
        
        let jdUrl = null;
        let jdContent = null;
        
        if (jdBuffer && jdOriginalName) {
            console.log("Processing JD file...");
            jdUrl = await uplodToCloudinary(jdBuffer, jdOriginalName);
            if (jdUrl) {
                jdContent = await parseJD(jdUrl, true); 
            }
        } else if (jdText && jdText.trim()) {
            console.log("Processing JD text...");
            jdContent = jdText.trim();
        }
        
        const { type, position, experience, specialization, company, style, duration } = req.body;
        if (!type || !position || !experience || !specialization || !company || !style || !duration) {
            return res.status(400).json({ message: 'All required fields must be provided!' });
        }
        
        const interview = await prisma.interview.create({
            data: {
                type,
                position,
                experience,
                specialization,
                company,
                style,
                resumeUrl: resumeResult,
                resumeContent,
                jdUrl,
                jdContent,
                duration,
                userId
            }
        });
        
        const id = interview.id;
        return res.status(201).json({ 
            message: 'Interview created successfully!', 
            interviewId: id,
            hasJD: !!jdContent
        });
        
    } catch (err) {
        console.error("Error creating interview:", err);
        return res.status(500).json({ message: 'Internal server error!' });
    }
}

export default createInterview;