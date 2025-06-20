"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import { BarChart, Rocket, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import DashboardSkeleton from "@/components/Skeletons/DashBoardSkeleton";

export default function DashBoard() {
  const router = useRouter();
  const { userData, isLoading } = useAuth();
  const [tokenProcessed, setTokenProcessed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");
      
      if (token) {
        console.log("Token found in URL, storing...");
        localStorage.setItem("token", token);
        
        const url = new URL(window.location.href);
        url.searchParams.delete("token");
        window.history.replaceState({}, "", url.toString());
        
        window.location.reload();
      }
      
      setTokenProcessed(true);
    }
  }, []);

  if (!tokenProcessed || isLoading) {
    return (
      <div><DashboardSkeleton/></div>
    );
  }

  const hasToken = typeof window !== "undefined" && localStorage.getItem("token");
  
  if (!hasToken && !userData) {
    router.replace("/");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Redirecting to login...</div>
      </div>
    );
  }

  if (hasToken && !userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Authenticating...</div>
      </div>
    );
  }

  const interviewsCompleted = userData?.interviews?.length || 0;
  console.log(userData?.interviews);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-10">
      <div className="text-3xl font-bold text-foreground">
        Hey {userData?.name || "champion"}! Ready to{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
          crush
        </span>{" "}
        your next interview?
      </div>

      <Card className="bg-muted">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <BarChart className="h-5 w-5" /> Your Growth Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center text-sm sm:text-base">
            <div>
              <p className="text-2xl font-bold text-primary">{interviewsCompleted}</p>
              <p className="text-muted-foreground">Interviews Completed</p>
            </div>

            <div>
              <p className="text-2xl font-bold text-green-600">50+</p>
              <p className="text-muted-foreground">Interviews to Master a Role</p>
            </div>

            <div>
              <p className="text-2xl font-bold text-yellow-400">18 hrs</p>
              <p className="text-muted-foreground">Avg. Time to Build Confidence</p>
            </div>

            <div>
              <p className="text-2xl font-bold text-indigo-500">5+</p>
              <p className="text-muted-foreground">Domains To Train with FOA</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2 text-primary">
              <Rocket className="h-5 w-5" /> Create Interview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Choose your role, experience level, and start your mock interview instantly.
            </p>
            <Button onClick={() => router.push("/create")}>
              Start Interview
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2 text-secondary-foreground">
              <Clock className="h-5 w-5" /> Past Interviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              View your past attempts, summaries, strengths, and improvement areas.
            </p>
            <Button variant="secondary" onClick={() => router.push("/past-interview")}>
              View History
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="text-sm text-muted-foreground text-center pt-6">
        Practice regularly. Review summaries. Become unstoppable.
      </div>
    </div>
  );
}