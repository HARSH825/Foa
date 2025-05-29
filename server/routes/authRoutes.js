import { Router } from "express";
import passport from "../auth/gAuth.js";
const router = Router();
import jwt from 'jsonwebtoken';

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

export default router;
