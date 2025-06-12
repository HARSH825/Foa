import { Router } from "express";
const router = Router();
import prisma from "../config/prismaClient.js";
import  gAuthMiddleware  from "../middleware/gAuthMiddleware.js";
import createInterview from "../controllers/createInterview.js";
import multer from "multer";

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

//create new interview
router.post('/create',upload.single('resume'),gAuthMiddleware,createInterview);
// router.post('/start/:interviewId', gAuthMiddleware , upload.single('resume') , startInterview); // need to pass interviewid in params .
export default router;