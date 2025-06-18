import { Router } from "express";
import passport from "../auth/gAuth.js";
const router = Router();
import jwt from 'jsonwebtoken';
import prisma from "../config/prismaClient.js";
router.get('/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/signin' , session: false }),
    (req, res) => {
        // success, redirect home.
        const user = req.user;
        const token= jwt.sign({id:user.id,email:user.emails?.[0].value}, process.env.JWT_SECRET, {expiresIn: '3d'});
        // console.log("User authenticated successfully:", user);
        // console.log("Token generated successfully:", token);
        res.redirect('http://localhost:3000/home?token=' + token); 
        
    }
);

router.get('/logout', (req, res) => {  
    req.logout((err) => {
        if (err) {
            return res.status(500).send('Logout failed');
        }
        res.redirect('/signin');
    });
});

router.get('/profile', async (req, res) => {
  const authHeader = req.headers.authorization;
    // console.log("auth header : "+authHeader);
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "Token required or improperly formatted" });
  }

  const token = authHeader.split(" ")[1]; 

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        picture: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // console.log("User is : "+user);
    res.json(user);
  } catch (err) {
    console.error("Failed to fetch user profile:", err);
    return res.status(403).json({ msg: "Invalid or expired token" });
  }
});


export default router;
