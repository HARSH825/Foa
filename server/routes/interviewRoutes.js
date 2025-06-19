import { Router } from "express";
const router = Router();
import prisma from "../config/prismaClient.js";
import  gAuthMiddleware  from "../middleware/gAuthMiddleware.js";
import createInterview from "../controllers/createInterview.js";
import multer, { memoryStorage } from "multer";
import startInterview from "../controllers/startInterview.js";
import getSummary from "../controllers/getSummary.js"
import { getPastInterview } from "../controllers/getPastInterview.js";

const upload = multer({
    storage: multer.memoryStorage(), 
    limits:{fileSize:2*1024*1024},
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed!'), false);
        }
    }
});

const upload2 = multer({
    storage: memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, 
    fileFilter: (req, file, cb) => {
        const allowed = ['audio/wav', 'audio/mpeg', 'audio/webm', 'audio/mp4'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only audio files are allowed'), false);
        }
    }
});


router.post('/create',upload.single('resume'),gAuthMiddleware,createInterview);
router.post('/start/:interviewId',upload2.single('userMessage'), gAuthMiddleware, startInterview); // need to pass interviewid in params .
router.get('/summary/:interviewId' , gAuthMiddleware , getSummary);
router.post('/pastInterview',gAuthMiddleware,getPastInterview);

export default router;