"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { SummaryData } from "@/types/form";
import SummarySkeleton from "@/components/Skeletons/SummarySkeleton";

export default function SummaryPage() {
  const { interviewId } = useParams();
  const router = useRouter();
  const { userData } = useAuth();

  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }

      try {
        const res = await fetch(`http://localhost:4000/api/v1/interview/summary/${interviewId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        const parsed = typeof data.summary === "string" ? JSON.parse(data.summary) : data.summary;
        setSummaryData(parsed);
      } catch (err) {
        console.error("Error fetching or parsing summary:", err);
        setSummaryData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [interviewId, router]);

  if (loading) {
    return <SummarySkeleton/>;
  }

  if (!summaryData) {
    return <div className="text-center text-red-500 py-10">Failed to generate or load summary.Summary is available only when you have taken Interview/s .</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-foreground mb-6">Interview Summary</h2>

      <section className="mb-8">
        <h3 className="text-2xl font-bold text-green-600 mb-2"> Strengths</h3>
        <ul className="space-y-3">
          {summaryData.strengths.map((item, idx) => (
            <li key={idx} className="bg-card border border-border p-4 rounded-lg">
              <p className="font-medium text-foreground text-xl">{item.point}</p>
              <p className="text-muted-foreground text-lg mt-1">{item.example}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-8">
        <h3 className="text-2xl font-bold text-yellow-600 mb-2">⚠️ Weaknesses</h3>
        <ul className="space-y-4">
          {summaryData.weaknesses.map((item, idx) => (
            <li key={idx} className="bg-card border border-border p-4 rounded-lg">
              <p className="font-medium text-foreground text-xl">{item.issue}</p>
              <p className=" text-muted-foreground mt-1 text-lg">{item.advice}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">AI Recommendations</h3>
        <ol className="text-lg list-decimal list-inside space-y-3 bg-card border border-border p-4 rounded-lg text-muted-foreground">
          {summaryData.recommendations.map((rec, idx) => (
            <li key={idx}>{rec}</li>
          ))}
        </ol>
      </section>

      <div className="mt-6 text-right">
        <button
          className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
          onClick={() => router.push("/past-interviews")}
        >
          ← Back to Past Interviews
        </button>
      </div>
    </div>
  );
}
