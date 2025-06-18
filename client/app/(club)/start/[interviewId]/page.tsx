"use client";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

export default function StartInterview() {
  const { interviewId } = useParams();
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [chat, setChat] = useState<{ sender: string; message: string }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const audioChunks = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!navigator.mediaDevices) return;
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => audioChunks.current.push(e.data);
      recorder.onstop = handleStop;
      setMediaRecorder(recorder);
    });
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  useEffect(() => {
    if (isRecording) {
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setRecordingTime(0);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = () => {
    if (!mediaRecorder) return;
    audioChunks.current = [];
    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const handleStop = async () => {
    const blob = new Blob(audioChunks.current, { type: "audio/webm" });
    const formData = new FormData();
    formData.append("userMessage", blob);

    const token = localStorage.getItem("token");
    
    try {
      const res = await fetch(`http://localhost:4000/api/v1/interview/start/${interviewId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setChat(prev => [
          ...prev,
          { sender: "user", message: data.userMessage },
          { sender: "AI", message: data.response },
        ]);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-light text-white tracking-wide">Live Interview</h1>
          <div className="w-16 h-px bg-white/20 mx-auto"></div>
          <p className="text-gray-500 text-sm">Interview ID: {interviewId}</p>
        </div>

        {/* Chat Container */}
        <div className="bg-black border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm">
          <div className="h-96 overflow-y-auto p-8 space-y-6">
            {chat.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 mx-auto border border-white/10 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm">Press record to begin your interview</p>
                </div>
              </div>
            ) : (
              chat.map((c, i) => (
                <div
                  key={i}
                  className={`flex ${c.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-md px-6 py-4 ${
                      c.sender === "user"
                        ? "bg-white text-black rounded-2xl rounded-br-sm"
                        : "bg-white/5 text-white rounded-2xl rounded-bl-sm border border-white/10"
                    }`}
                  >
                    <div className={`text-xs font-medium mb-2 ${c.sender === "user" ? "text-black/60" : "text-white/40"}`}>
                      {c.sender === "user" ? "YOU" : "INTERVIEWER"}
                    </div>
                    <div className="leading-relaxed">{c.message}</div>
                  </div>
                </div>
              ))
            )}
            
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-white/5 text-white rounded-2xl rounded-bl-sm border border-white/10 px-6 py-4 max-w-md">
                  <div className="text-xs font-medium mb-2 text-white/40">INTERVIEWER</div>
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-white/60">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Recording Status Bar */}
          {isRecording && (
            <div className="bg-red-600 px-6 py-3 flex items-center justify-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                <span className="text-white font-medium">Recording</span>
              </div>
              <div className="text-white font-mono text-lg">
                {formatTime(recordingTime)}
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="bg-gray-750 p-6 flex justify-center space-x-4">
            {!isRecording ? (
              <button
                onClick={startRecording}
                disabled={isProcessing}
                className="flex items-center space-x-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <span>Start Recording</span>
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="flex items-center space-x-3 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="2"/>
                </svg>
                <span>Stop & Send</span>
              </button>
            )}

            {chat.length > 0 && (
              <button
                onClick={() => setChat([])}
                className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-4 rounded-xl font-medium transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Clear Chat</span>
              </button>
            )}
          </div>
        </div>

        {/* Interview Tips */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
          <h3 className="text-white font-medium mb-2">💡 Interview Tips</h3>
          <ul className="text-gray-400 text-sm space-y-1">
            <li>• Speak clearly and at a moderate pace</li>
            <li>• Take your time to think before answering</li>
            <li>• Ask for clarification if needed</li>
            <li>• Be specific with your examples</li>
          </ul>
        </div>
      </div>
    </div>
  );
}