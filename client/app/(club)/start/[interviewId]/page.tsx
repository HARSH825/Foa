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
      clearInterval(intervalRef.current!);
      setRecordingTime(0);
    }

    return () => {
      clearInterval(intervalRef.current!);
    };
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
        if (data.speech && data.mimeType) {
          try {
            const audio = new Audio(`data:${data.mimeType};base64,${data.speech}`);
            await audio.play();
          } catch (err) {
            console.error("Audio playback error:", err);
          }
        }

        setChat(prev => [
          ...prev,
          { sender: "user", message: data.userMessage },
          { sender: "AI", message: data.response },
        ]);
      } else {
        alert(data.message || "Error during interview.");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Something went wrong.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-light tracking-wide">Live Interview</h1>
          <div className="w-16 h-px bg-white/20 mx-auto" />
          <p className="text-gray-500 text-sm">Interview ID: {interviewId}</p>
        </div>

        <div className="bg-black border border-white/10 rounded-3xl overflow-hidden">
          <div className="h-96 overflow-y-auto p-8 space-y-6">
            {chat.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Press record to begin your interview</p>
              </div>
            ) : (
              chat.map((c, i) => (
                <div key={i} className={`flex ${c.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-md px-6 py-4 rounded-2xl ${
                      c.sender === "user"
                        ? "bg-white text-black"
                        : "bg-white/10 text-white border border-white/10"
                    }`}
                  >
                    <div className="text-xs font-medium mb-2 opacity-60">
                      {c.sender === "user" ? "YOU" : "INTERVIEWER"}
                    </div>
                    <div className="leading-relaxed whitespace-pre-wrap">{c.message}</div>
                  </div>
                </div>
              ))
            )}

            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-white/10 text-white rounded-2xl px-6 py-4 max-w-md">
                  <div className="text-xs font-medium mb-2 opacity-60">INTERVIEWER</div>
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce delay-100" />
                      <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce delay-200" />
                    </div>
                    <span className="text-sm text-white/60">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {isRecording && (
            <div className="bg-red-600 px-6 py-3 flex items-center justify-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                <span className="font-medium">Recording</span>
              </div>
              <div className="font-mono text-lg">{formatTime(recordingTime)}</div>
            </div>
          )}

          <div className="bg-gray-800 p-6 flex justify-center space-x-4">
            {!isRecording ? (
              <button
                onClick={startRecording}
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-8 py-4 rounded-xl font-medium transition-all"
              >
                Start Recording
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-medium transition-all"
              >
                Stop & Send
              </button>
            )}

            {chat.length > 0 && (
              <button
                onClick={() => setChat([])}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-4 rounded-xl font-medium"
              >
                Clear Chat
              </button>
            )}
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
          <h3 className="font-medium mb-2">💡 Interview Tips</h3>
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