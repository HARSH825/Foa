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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioChunks = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const speechSynthesis = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSynthesis.current = window.speechSynthesis;
    }

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

  const speakText = (text: string) => {
    if (!speechSynthesis.current) {
      console.error("Speech synthesis not supported");
      return;
    }

    speechSynthesis.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.3;
    utterance.pitch = 1.5;
    utterance.volume = 1.0;

    const voices = speechSynthesis.current.getVoices();
    const preferredVoice = voices.find(voice =>
      voice.name.includes('English') &&
      (voice.name.includes('Female') || voice.name.includes('Male'))
    ) || voices.find(voice => voice.default);

    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      setIsSpeaking(false);
    };

    speechSynthesis.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (speechSynthesis.current) {
      speechSynthesis.current.cancel();
      setIsSpeaking(false);
    }
  };

  const startRecording = () => {
    if (!mediaRecorder) return;
    stopSpeaking();
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
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setChat(prev => [
          ...prev,
          { sender: "user", message: data.userMessage },
          { sender: "AI", message: data.response },
        ]);

        setTimeout(() => {
          speakText(data.response);
        }, 500);
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
          <div className="h-[520px] overflow-y-auto p-8 space-y-6">
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

         {isSpeaking && (
  <div className="relative px-6 py-3 flex items-center justify-center overflow-hidden rounded-b-3xl bg-gradient-to-r from-purple-500 via-blue-600 to-indigo-500">
    <svg
      className="absolute bottom-0 left-0 w-full h-full opacity-10"
      viewBox="0 0 1440 320"
      preserveAspectRatio="none"
    >
      <path
        fill="white"
        fillOpacity="1"
        d="M0,160L60,149.3C120,139,240,117,360,112C480,107,600,117,720,133.3C840,149,960,171,1080,176C1200,181,1320,171,1380,165.3L1440,160L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
      >
        <animate
          attributeName="d"
          dur="6s"
          repeatCount="indefinite"
          values="
            M0,160L60,149.3C120,139,240,117,360,112C480,107,600,117,720,133.3C840,149,960,171,1080,176C1200,181,1320,171,1380,165.3L1440,160L1440,320L0,320Z;
            M0,140L80,160C160,180,320,180,480,160C640,140,800,100,960,80C1120,60,1280,80,1440,120L1440,320L0,320Z;
            M0,160L60,149.3C120,139,240,117,360,112C480,107,600,117,720,133.3C840,149,960,171,1080,176C1200,181,1320,171,1380,165.3L1440,160L1440,320L0,320Z
          "
        />
      </path>
    </svg>

        <div className="relative z-10 flex items-center space-x-3 text-white">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-white rounded-full animate-ping" />
            <div className="w-2 h-2 bg-white rounded-full animate-ping delay-100" />
            <div className="w-2 h-2 bg-white rounded-full animate-ping delay-200" />
          </div>
          <span className="text-sm font-medium">AI Speaking</span>
          <button
            onClick={stopSpeaking}
            className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-sm transition-all"
          >
            Stop
          </button>
        </div>
      </div>
    )}


          <div className="bg-gray-800 p-6 flex justify-center space-x-4">
            {!isRecording ? (
              <button
                onClick={startRecording}
                disabled={isProcessing || isSpeaking}
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

            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-4 rounded-xl font-medium"
              >
                Stop Speaking
              </button>
            )}

            {chat.length > 0 && (
              <button
                onClick={() => {
                  setChat([]);
                  stopSpeaking();
                }}
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
            <li>• Wait for the AI to finish speaking before recording</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
