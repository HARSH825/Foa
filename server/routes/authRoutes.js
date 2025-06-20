import { Router } from "express";
import passport from "../auth/gAuth.js";
import jwt from "jsonwebtoken";
import prisma from "../config/prismaClient.js";

const router = Router();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/",
    session: false, 
  }),
  (req, res) => {
    try {
      const user = req.user;

      if (!user || !user.id || !user.email) {
        console.error(" Missing user data in Google callback:", user);
        return res.status(400).json({ error: "Incomplete user data" });
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email, 
        },
        process.env.JWT_SECRET,
        { expiresIn: "3d" }
      );

      res.redirect(`https://app.foa.run.place/home?token=${token}`);
    } catch (err) {
      console.error(" Error in Google callback handler:", err);
      res.status(500).json({ error: "Internal server error during auth" });
    }
  }
);

router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error(" Logout failed:", err);
      return res.status(500).send("Logout failed");
    }
    res.redirect("/signin");
  });
});

router.get("/profile", async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn(" Missing or malformed Authorization header");
    return res
      .status(401)
      .json({ msg: "Token required or improperly formatted" });
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
        interviews: true, 
      },
    });

    if (!user) {
      console.warn(" Token valid but user not found:", decoded.id);
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error(" Token verification failed or DB error:", err);
    return res.status(403).json({ msg: "Invalid or expired token" });
  }
});

export default router;
