import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import prisma from '../config/prismaClient.js';
dotenv.config();

console.log("Google Strategy initialized");
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
},
async function(accessToken, refreshToken, profile, done) {
    //save user profile to database 
    // console.log("Google Strategy callback invoked with profile:", profile);
    try{
        let user = await prisma.user.findUnique({
            where: {
                googleId: profile.id
            }
        });
        // console.log("User found in database:", user);
        if(user){
            return done(null, user);
        }
        else{
            user = await prisma.user.create({
                data:{
                    googleId   : profile.id,
                    name       : profile.displayName,
                    email      : profile.emails?.[0].value,
                    picture      : profile.photos?.[0].value
                }
            })
            return done(null, user);
        }

    }
    catch(err){
        console.error("Error in Google Strategy:", err);
        return done(err, null);
    }
    
}));
export default passport;
