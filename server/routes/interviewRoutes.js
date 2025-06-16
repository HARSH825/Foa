import { Router } from "express";
const router = Router();
import prisma from "../config/prismaClient.js";
import  gAuthMiddleware  from "../middleware/gAuthMiddleware.js";
import createInterview from "../controllers/createInterview.js";
import multer from "multer";
import startInterview from "../controllers/startInterview.js";
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

router.post('/create',upload.single('resume'),gAuthMiddleware,createInterview);
router.post('/start/:interviewId', gAuthMiddleware, startInterview); // need to pass interviewid in params .
export default router;