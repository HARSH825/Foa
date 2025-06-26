"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { BE_URL } from "@/config";

export default function StartInterview() {
  const { interviewId } = useParams();
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [chat, setChat] = useState<{ sender: string; message: string }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoRecordEnabled, setAutoRecordEnabled] = useState(true);
  
  const audioChunks = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null); 
  const chatEndRef = useRef<HTMLDivElement>(null);
  const speechSynthesis = useRef<SpeechSynthesis | null>(null);
  const autoRecordTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const cleanupServices = () => {
    if (isRecording && mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }

    if (speechSynthesis.current) {
      speechSynthesis.current.cancel();
      setIsSpeaking(false);
    }

    // Clear timeouts and intervals
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (autoRecordTimeoutRef.current) {
      clearTimeout(autoRecordTimeoutRef.current);
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    setIsProcessing(false);
    setRecordingTime(0);
  };

  const endInterview = () => {
    if (confirm("Are you sure you want to end this interview?")) {
      cleanupServices();
      router.push('/home');
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && !event.shiftKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        if (isRecording) {
          stopRecording();
        } else if (!isProcessing && !isSpeaking && mediaRecorder) {
          startRecording();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isRecording, isProcessing, isSpeaking, mediaRecorder]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSynthesis.current = window.speechSynthesis;
    }

    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      const options = {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 16000, 
      };
      
      let recorder;
      if (MediaRecorder.isTypeSupported(options.mimeType)) {
        recorder = new MediaRecorder(stream, options);
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        recorder = new MediaRecorder(stream, { mimeType: 'audio/webm', audioBitsPerSecond: 16000 });
      } else {
        recorder = new MediaRecorder(stream);
      }
      
      recorder.ondataavailable = (e) => audioChunks.current.push(e.data);
      recorder.onstop = handleStop;
      setMediaRecorder(recorder);
      
      streamRef.current = stream;
    });

    return () => {
      cleanupServices();
    };
  }, []);

  useEffect(() => {
    if (chatContainerRef.current && chatEndRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chat]);

  useEffect(() => {
    if (isProcessing && chatContainerRef.current) {
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, 100); 
    }
  }, [isProcessing]);

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

  useEffect(() => {
    if (!isSpeaking && autoRecordEnabled && chat.length > 0 && !isRecording && !isProcessing) {
      if (autoRecordTimeoutRef.current) {
        clearTimeout(autoRecordTimeoutRef.current);
      }
      
      autoRecordTimeoutRef.current = setTimeout(() => {
        if (!isSpeaking && !isRecording && !isProcessing && mediaRecorder) {
          startRecording();
        }
      }, 1500);
    }

    return () => {
      if (autoRecordTimeoutRef.current) {
        clearTimeout(autoRecordTimeoutRef.current);
      }
    };
  }, [isSpeaking, autoRecordEnabled, chat.length, isRecording, isProcessing, mediaRecorder]);

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
    utterance.rate = 1.2;
    utterance.pitch = 1.8;
    utterance.volume = 1.0;

    const voices = speechSynthesis.getVoices();

const preferredMaleVoices = [
  "Google UK English Male", 
  "Microsoft David Desktop", 
  "Alex",                   
  "Daniel",                 
  "Google US English"       
];

const preferredVoice = voices.find(voice =>
  preferredMaleVoices.includes(voice.name)
) || voices.find(voice =>
  voice.name.toLowerCase().includes("male")
) || voices.find(voice => voice.default); 

if (preferredVoice) {
  utterance.voice = preferredVoice;
}

    utterance.onstart = () => {
      setIsSpeaking(true);
      if (autoRecordTimeoutRef.current) {
        clearTimeout(autoRecordTimeoutRef.current);
      }
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    
    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      setIsSpeaking(false);
    };

    speechSynthesis.current.speak(utterance);
  };

  const startRecording = () => {
    if (!mediaRecorder) return;
    if (autoRecordTimeoutRef.current) {
      clearTimeout(autoRecordTimeoutRef.current);
    }
    audioChunks.current = [];
    mediaRecorder.start(1000); 
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
    
    const maxSize = 10 * 1024 * 1024; 
    console.log(`Audio file size: ${(blob.size / 1024 / 1024).toFixed(2)}MB`);
    
    if (blob.size > maxSize) {
      alert(`Recording too long (${(blob.size / 1024 / 1024).toFixed(2)}MB). Please keep responses shorter.`);
      setIsProcessing(false);
      return;
    }

    const formData = new FormData();
    formData.append("userMessage", blob, "audio.webm");

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${BE_URL}/api/v1/interview/start/${interviewId}`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Server response:', res.status, errorText);
        
        if (res.status === 413) {
          alert("Recording is too large. Please keep your responses shorter (under 5 minutes).");
        } else {
          alert(`Server error (${res.status}): ${errorText}`);
        }
        return;
      }

      const data = await res.json();

      setChat(prev => [
        ...prev,
        { sender: "user", message: data.userMessage },
        { sender: "AI", message: data.response },
      ]);

      setTimeout(() => {
        speakText(data.response);
      }, 500);

    } catch (error) {
      console.error("Fetch error:", error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        alert("Network error. Please check your connection and try again.");
      } else {
        alert("Something went wrong. Please try again.");
      }
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

        <div className="flex justify-center space-x-6">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex items-center space-x-3">
            <span className="text-sm font-medium">Auto Recording:</span>
            <button
              onClick={() => setAutoRecordEnabled(!autoRecordEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoRecordEnabled ? 'bg-green-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoRecordEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="text-xs text-gray-400">
              {autoRecordEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>

          <button
            onClick={endInterview}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl font-medium transition-all flex items-center space-x-2"
          >
            <span>END INTERVIEW</span>
          </button>
        </div>

        <div className="bg-black border border-white/10 rounded-3xl overflow-hidden">
          <div 
            ref={chatContainerRef}
            className="h-[520px] overflow-y-auto p-8 space-y-6"
          >
            {chat.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-2">
                  <p className="text-gray-500">Press record or Enter to begin your interview</p>
                  {autoRecordEnabled && (
                    <p className="text-gray-600 text-xs">
                      Auto recording is enabled - recording will start automatically after AI finishes speaking
                    </p>
                  )}
                </div>
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
                <span className="font-medium">
                  {autoRecordEnabled && chat.length > 0 ? "Auto Recording" : "Recording"}
                </span>
              </div>
              <div className="font-mono text-lg">{formatTime(recordingTime)}</div>
              <div className="text-xs">
                Press Enter to stop
              </div>
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
                {autoRecordEnabled && (
                  <span className="text-xs bg-white/20 px-2 py-1 rounded">
                    Will auto-record when finished
                  </span>
                )}
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
                {autoRecordEnabled && chat.length > 0 ? "Manual Record" : "Start Recording"}
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
                onClick={() => {
                  setChat([]);
                  if (autoRecordTimeoutRef.current) {
                    clearTimeout(autoRecordTimeoutRef.current);
                  }
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
            <li>• Keep responses under 2 minutes to avoid file size issues</li>
            <li>• Take your time to think before answering</li>
            <li>• Ask for clarification if needed</li>
            <li>• Be specific with your examples</li>
            <li>• Press <kbd className="bg-gray-700 px-1 rounded text-white">Enter</kbd> to start/stop recording</li>
            <li>• {autoRecordEnabled ? "Recording will start automatically 1.5 seconds after AI finishes speaking" : "Click 'Start Recording' when ready to respond"}</li>
            <li>• Use Enter key to stop recording when you're done speaking</li>
            <li>• Toggle auto-recording using the switch above</li>
            <li>• Click "END INTERVIEW" to finish and return to past interviews</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
