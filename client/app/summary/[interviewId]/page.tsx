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

  const truncateText = (text: string, limit: number = 200) => {
    if (text.length <= limit) return text;
    return text.substring(0, limit) + "...";
  };

  if (loading) {
    return <SummarySkeleton />;
  }

  if (!summaryData && !idealAnswersData) {
    return (
      <div className="text-center text-red-500 py-10">
        Failed to generate or load summary. Summary is available only when you have taken Interview/s.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-foreground mb-6">Interview Analysis</h2>

      {/* Tab Navigation */}
      <div className="flex border-b border-border mb-6">
        <button
          className={`px-6 py-3 font-medium text-lg transition-colors ${
            activeTab === 'ideal'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('ideal')}
        >
          Ideal Answers
        </button>
        <button
          className={`px-6 py-3 font-medium text-lg transition-colors ${
            activeTab === 'summary'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('summary')}
        >
          Summary
        </button>
      </div>

      {/* Ideal Answers Tab */}
      {activeTab === 'ideal' && (
        <div className="space-y-6">
          {processedChat.length > 0 ? (
            processedChat.map((chat, index) => (
              <div key={index} className="bg-card border border-border rounded-lg p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-blue-600 mb-2">
                    Question {chat.questionIndex}:
                  </h3>
                  <div className="text-foreground text-base">
                    <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {expandedQuestions.has(index) 
                          ? chat.question 
                          : truncateText(chat.question, 200)
                        }
                      </p>
                      {chat.question.length > 200 && (
                        <button
                          onClick={() => toggleExpandQuestion(index)}
                          className="text-blue-600 hover:text-blue-800 text-sm mt-2 font-medium underline"
                        >
                          {expandedQuestions.has(index) ? 'Show Less' : 'Read More'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-md font-medium text-gray-600 mb-2">Your Answer:</h4>
                  <div className="text-muted-foreground text-sm bg-gray-50 p-3 rounded border-l-4 border-gray-300">
                    <p className="whitespace-pre-wrap">{chat.answer}</p>
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => toggleExpandAnswer(index)}
                    className="flex items-center gap-2 text-green-600 font-medium hover:text-green-700 transition-colors mb-2"
                  >
                    <span>💡 Ideal Answer</span>
                    <span className="text-sm">
                      {expandedAnswers.has(index) ? '▼' : '▶'}
                    </span>
                  </button>
                  
                  {expandedAnswers.has(index) && (
                    <div className="bg-green-50 p-4 rounded border-l-4 border-green-400">
                      <p className="text-green-800 text-sm leading-relaxed whitespace-pre-wrap">
                        {chat.idealAnswer}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No question-answer data available for this interview.
            </div>
          )}
        </div>
      )}

      {/* Summary Tab */}
      {activeTab === 'summary' && summaryData && (
        <div>
          <section className="mb-8">
            <h3 className="text-2xl font-bold text-green-600 mb-2">✅ Strengths</h3>
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
                  <p className="text-muted-foreground mt-1 text-lg">{item.advice}</p>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">
              🤖 AI Recommendations
            </h3>
            <ol className="text-lg list-decimal list-inside space-y-3 bg-card border border-border p-4 rounded-lg text-muted-foreground">
              {summaryData.recommendations.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ol>
          </section>
        </div>
      )}

      <div className="mt-8 text-right">
        <button
          className="bg-primary text-primary-foreground px-6 py-3 rounded hover:bg-primary/90 transition-colors"
          onClick={() => router.push("/past-interview")}
        >
          ← Back to Past Interviews
        </button>
      </div>
    </div>
  );
}