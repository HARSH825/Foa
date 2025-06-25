"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { SummaryData } from "@/types/form";
import SummarySkeleton from "@/components/Skeletons/SummarySkeleton";
import { BE_URL } from "@/config";

interface IdealAnswer {
  ideal_answer: string;
}

interface IdealAnswersData {
  [key: string]: IdealAnswer;
}

interface ChatMessage {
  question: string;
  answer: string;
  idealAnswer: string;
  questionIndex: number;
}

export default function SummaryPage() {
  const { interviewId } = useParams();
  const router = useRouter();
  const { userData } = useAuth();

  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [idealAnswersData, setIdealAnswersData] = useState<IdealAnswersData | null>(null);
  const [chatHistory, setChatHistory] = useState<string>("");
  const [processedChat, setProcessedChat] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ideal' | 'summary'>('ideal');
  const [expandedAnswers, setExpandedAnswers] = useState<Set<number>>(new Set());
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchSummary = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }

      try {
        const res = await fetch(`${BE_URL}/api/v1/interview/summary/${interviewId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        
        const parsedSummary = typeof data.summary === "string" ? JSON.parse(data.summary) : data.summary;
        setSummaryData(parsedSummary);

        const parsedIdealAnswers = typeof data.idealAns === "string" ? JSON.parse(data.idealAns) : data.idealAns;
        setIdealAnswersData(parsedIdealAnswers);

        setChatHistory(data.chatHistory || "");

        if (data.chatHistory) {
          const processed = processChatHistory(data.chatHistory, parsedIdealAnswers);
          setProcessedChat(processed);
        }

      } catch (err) {
        console.error("Error fetching or parsing summary:", err);
        setSummaryData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [interviewId, router]);

  const processChatHistory = (chatHistory: string, idealAnswers: IdealAnswersData): ChatMessage[] => {
    const lines = chatHistory.split('\n').filter(line => line.trim());
    const messages: ChatMessage[] = [];
    let currentQuestion = "";
    let answerIndex = 1; 

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('AI :')) {
        currentQuestion = line.replace('AI :', '').trim();
      } 
      else if (line.startsWith('USER :') && currentQuestion) {
        const userAnswer = line.replace('USER :', '').trim();
        const idealAnswer = idealAnswers[answerIndex.toString()]?.ideal_answer || "No ideal answer provided";
        
        messages.push({
          question: currentQuestion,
          answer: userAnswer,
          idealAnswer: idealAnswer,
          questionIndex: answerIndex
        });
        
        answerIndex++;
        currentQuestion = ""; 
      }
    }

    return messages;
  };

  const toggleExpandAnswer = (index: number) => {
    const newExpanded = new Set(expandedAnswers);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedAnswers(newExpanded);
  };

  const toggleExpandQuestion = (index: number) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedQuestions(newExpanded);
  };

  const truncateText = (text: string, limit: number = 300) => {
    if (text.length <= limit) return text;
    return text.substring(0, limit) + "...";
  };

  if (loading) {
    return <SummarySkeleton />;
  }

  if (!summaryData && !idealAnswersData) {
    return (
      <div className="min-h-screen bg-black">
        <div className="text-center text-red-400 py-10">
          Failed to generate or load summary. Summary is available only when you have taken Interview/s.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-4xl font-bold text-white mb-8">Interview Analysis</h2>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-700 mb-8">
          <button
            className={`px-6 py-3 font-medium text-lg transition-colors ${
              activeTab === 'ideal'
                ? 'border-b-2 border-blue-400 text-blue-400'
                : 'text-slate-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('ideal')}
          >
            Ideal Answers
          </button>
          <button
            className={`px-6 py-3 font-medium text-lg transition-colors ${
              activeTab === 'summary'
                ? 'border-b-2 border-blue-400 text-blue-400'
                : 'text-slate-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('summary')}
          >
            Summary
          </button>
        </div>

        {/* Ideal Answers Tab */}
        {activeTab === 'ideal' && (
          <div className="space-y-8">
            {processedChat.length > 0 ? (
              processedChat.map((chat, index) => (
                <div key={index} className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:bg-slate-750 transition-colors">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-blue-400 mb-4 flex items-center gap-2">
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                        Q{chat.questionIndex}
                      </span>
                      Question:
                    </h3>
                    <div className="text-white text-base">
                      <div className="bg-slate-700 p-4 rounded-lg border-l-4 border-blue-400">
                        <p className="whitespace-pre-wrap leading-relaxed text-slate-100">
                          {expandedQuestions.has(index) 
                            ? chat.question 
                            : truncateText(chat.question, 400)
                          }
                        </p>
                        {chat.question.length > 400 && (
                          <button
                            onClick={() => toggleExpandQuestion(index)}
                            className="text-blue-400 hover:text-blue-300 text-sm mt-3 font-medium underline transition-colors"
                          >
                            {expandedQuestions.has(index) ? 'Show Less' : 'Read More'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-lg font-medium text-slate-300 mb-3 flex items-center gap-2">
                      <span className="text-red-400">👤</span>
                      Your Answer:
                    </h4>
                    <div className="text-slate-200 text-sm bg-slate-700 p-4 rounded-lg border-l-4 border-red-400">
                      <p className="whitespace-pre-wrap leading-relaxed">{chat.answer}</p>
                    </div>
                  </div>

                  <div>
                    <button
                      onClick={() => toggleExpandAnswer(index)}
                      className="flex items-center gap-2 text-green-400 font-medium hover:text-green-300 transition-colors mb-3 text-lg"
                    >
                      <span> Ideal Answer</span>
                      <span className="text-sm">
                        {expandedAnswers.has(index) ? '▼' : '▶'}
                      </span>
                    </button>
                    
                    {expandedAnswers.has(index) && (
                      <div className="bg-slate-700 p-4 rounded-lg border-l-4 border-green-400">
                        <p className="text-green-100 text-sm leading-relaxed whitespace-pre-wrap">
                          {chat.idealAnswer}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-400 py-12">
                <div className="text-6xl mb-4"></div>
                <p className="text-xl">No question-answer data available for this interview.</p>
              </div>
            )}
          </div>
        )}

        {/* Summary Tab */}
        {activeTab === 'summary' && summaryData && (
          <div className="space-y-8">
            <section className="mb-10">
              <h3 className="text-3xl font-bold text-green-400 mb-6 flex items-center gap-3">
                <span></span> Strengths
              </h3>
              <div className="grid gap-4">
                {summaryData.strengths.map((item, idx) => (
                  <div key={idx} className="bg-slate-800 border border-slate-700 p-6 rounded-lg hover:bg-slate-750 transition-colors">
                    <p className="font-semibold text-white text-xl mb-2">{item.point}</p>
                    <p className="text-slate-300 text-lg leading-relaxed">{item.example}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mb-10">
              <h3 className="text-3xl font-bold text-yellow-400 mb-6 flex items-center gap-3">
                <span></span> Areas for Improvement
              </h3>
              <div className="grid gap-4">
                {summaryData.weaknesses.map((item, idx) => (
                  <div key={idx} className="bg-slate-800 border border-slate-700 p-6 rounded-lg hover:bg-slate-750 transition-colors">
                    <p className="font-semibold text-white text-xl mb-2">{item.issue}</p>
                    <p className="text-slate-300 text-lg leading-relaxed">{item.advice}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text mb-6 flex items-center gap-3">
                <span className="text-purple-400"></span> AI Recommendations
              </h3>
              <div className="bg-slate-800 border border-slate-700 p-6 rounded-lg">
                <ol className="text-lg list-decimal list-inside space-y-4 text-slate-200">
                  {summaryData.recommendations.map((rec, idx) => (
                    <li key={idx} className="leading-relaxed pl-2">{rec}</li>
                  ))}
                </ol>
              </div>
            </section>
          </div>
        )}

        <div className="mt-12 text-right">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition-colors font-medium text-lg"
            onClick={() => router.push("/past-interview")}
          >
            ← Back to Past Interviews
          </button>
        </div>
      </div>
    </div>
  );
}