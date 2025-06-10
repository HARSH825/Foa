import { Router } from "express";
const router = Router();
import prisma from "../config/prismaClient.js";
import { gAuthMiddleware } from "../middleware/gAuthMiddleware.js";

