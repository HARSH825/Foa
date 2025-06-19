"use client";

import { FaGithub, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="border-t border-border mt-12 py-6 text-sm text-muted-foreground text-center bg-background">
      <p className="mb-2">
        Made with 💻 by{" "}
        <span className="text-foreground font-medium">Harsh Chhallani</span>
      </p>
      <div className="flex justify-center gap-6 text-xl">
        <a
          href="https://github.com/HARSH825"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors"
        >
          <FaGithub />
        </a>
        <a
          href="https://www.linkedin.com/in/harsh-chhallani1937"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors"
        >
          <FaLinkedin />
        </a>
      </div>
    </footer>
  );
}
