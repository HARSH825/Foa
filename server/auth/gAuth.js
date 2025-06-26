import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import prisma from '../config/prismaClient.js';

dotenv.config();

console.log(" Google Strategy initialized");

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://apifoai.up.railway.app/auth/google/callback",
    scope: ['profile', 'email'],
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      if (!profile || !profile.id) {
        return done(new Error("No Google profile data found"), null);
      }

      let user = await prisma.user.findUnique({
        where: { googleId: profile.id },
      });

      if (user) {
        return done(null, user);
      }

      const newUserData = {
        googleId: profile.id,
        name: profile.displayName || "Unnamed User",
        email: profile.emails?.[0]?.value || null,
        picture: profile.photos?.[0]?.value || null,
      };

      user = await prisma.user.create({ data: newUserData });

      return done(null, user);
    } catch (err) {
      console.error("Error during Google OAuth strategy:", err);

      if (err.code === 'P2002') {
        return done(new Error("Duplicate entry found in DB"), null);
      }

      return done(err, null);
    }
  }
));

export default passport;
