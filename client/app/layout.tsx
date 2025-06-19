import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/Theme";
import Header from "@/components/Header";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";
import Footer from "@/components/Footer";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI interview Platform",
  description: "FOA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        
        <AuthProvider>
          <Header/>
        <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange

        >
          <Toaster/>{children}<Toaster/>
          <Footer/>
        </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
