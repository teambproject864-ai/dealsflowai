"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Bot,
  Mic,
  MicOff,
  Send,
  Terminal,
  Loader2,
  CheckCircle2,
  XCircle,
  Info,
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { Header } from "@/components/Header";
import { getBrowserAgentController, type Command as Task } from "@/lib/browser-agent/unified-controller";

export default function BrowserAgentPage() {
  const router = useRouter();
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "disconnected">("connected");
  const recognitionRef = useRef<any>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const controller = getBrowserAgentController();

  // Initialize controller
  useEffect(() => {
    controller.setRouter(router);
    setConnectionStatus(controller.getConnectionStatus());
  }, [router, controller]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join("");
        if (event.results[0].isFinal) {
          handleVoiceCommand(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        addTask({
          type: "voice",
          input: "Voice recognition failed",
          status: "failed",
          error: `Error: ${event.error}`,
        });
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const addTask = (partialTask: Omit<Task, "id" | "startTime">) => {
    const newTask: Task = {
      id: Date.now().toString(),
      startTime: new Date(),
      ...partialTask,
    };
    setTasks((prev) => [newTask, ...prev]);
    trackEvent("browser_agent_task_added", { type: partialTask.type });
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleVoiceCommand = (transcript: string) => {
    setInputText(transcript);
    processTask(transcript, "voice");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    processTask(inputText, "text");
    setInputText("");
  };

  const processTask = async (input: string, type: "text" | "voice") => {
    const taskId = Date.now().toString();
    addTask({
      type,
      input,
      status: "in_progress",
    });

    try {
      const result = await controller.processCommand(input, type);
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? result
            : task
        )
      );
      trackEvent("browser_agent_task_completed", { type });
    } catch (error) {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? {
                id: taskId,
                type,
                input,
                status: "failed",
                startTime: new Date(),
                endTime: new Date(),
                error: (error as Error).message,
              }
            : task
        )
      );
      trackEvent("browser_agent_task_failed", { type, error: (error as Error).message });
    }
  };

  const clearTasks = () => {
    setTasks([]);
  };

  // Scroll terminal to bottom on new tasks
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = 0;
    }
  }, [tasks]);

  return (
    <div className="min-h-screen bg-[#060612] text-white flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-3 mb-4 px-4 py-2 rounded-full border border-teal-500/30 bg-teal-500/10">
              <Bot className="text-teal-400" />
              <span className="text-teal-300 text-sm font-semibold">Browser Agent</span>
              <span className={`flex items-center gap-1 text-xs ${connectionStatus === "connected" ? "text-emerald-400" : connectionStatus === "connecting" ? "text-amber-400" : "text-red-400"}`}>
                <span className={`w-2 h-2 rounded-full ${connectionStatus === "connected" ? "bg-emerald-400 animate-pulse" : connectionStatus === "connecting" ? "bg-amber-400 animate-ping" : "bg-red-400"}`} />
                {connectionStatus}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Unified Browser Control</h1>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Use text or voice commands to orchestrate multi-step browser automation workflows across the platform
            </p>
          </div>

          {/* Control Panel */}
          <div className="bg-gradient-to-b from-[#070718]/95 to-[#040410]/95 border border-white/10 rounded-3xl p-6 shadow-2xl shadow-black/40 mb-8">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your command here... (e.g., 'Run GTM Analysis' or 'Open Sales Pipeline')"
                  className="w-full bg-[#0A0A18] border border-white/15 rounded-2xl px-6 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/30 transition-all"
                />
              </div>
              <button
                type="button"
                onClick={toggleListening}
                className={`px-6 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                  isListening
                    ? "bg-red-500/20 border border-red-500/50 text-red-300 hover:bg-red-500/30"
                    : "bg-gradient-to-r from-teal-600 to-cyan-500 text-white hover:from-teal-500 hover:to-cyan-400 shadow-xl shadow-teal-600/30"
                }`}
                aria-label={isListening ? "Stop listening" : "Start listening"}
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                {isListening ? "Listening..." : "Voice"}
              </button>
              <button
                type="submit"
                className="px-6 py-4 bg-gradient-to-r from-violet-600 to-purple-500 text-white rounded-2xl font-semibold hover:from-violet-500 hover:to-purple-400 shadow-xl shadow-violet-600/30 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Send className="h-5 w-5" />
                Send
              </button>
            </form>
          </div>

          {/* Task Terminal */}
          <div className="bg-gradient-to-b from-[#070718]/95 to-[#040410]/95 border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <Terminal className="text-violet-400" />
                <h2 className="text-lg font-semibold">Task Execution Log</h2>
              </div>
              {tasks.length > 0 && (
                <button
                  onClick={clearTasks}
                  className="text-xs text-slate-400 hover:text-white transition-colors px-3 py-1 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10"
                >
                  Clear Log
                </button>
              )}
            </div>
            <div
              ref={terminalRef}
              className="h-96 overflow-y-auto p-6 space-y-4"
            >
              {tasks.length === 0 && (
                <div className="text-center py-20 text-slate-500">
                  <Info className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No tasks yet. Try sending a command to get started!</p>
                </div>
              )}
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="border border-white/10 rounded-2xl p-4 bg-[#0A0A18]"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {task.status === "in_progress" ? (
                        <Loader2 className="h-5 w-5 text-teal-400 animate-spin" />
                      ) : task.status === "completed" ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-400" />
                      )}
                      <div>
                        <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">
                          {task.type} Command
                        </span>
                        <p className="text-sm font-semibold">{task.input}</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-slate-500">
                      {task.startTime.toLocaleTimeString()}
                    </span>
                  </div>
                  {task.status !== "pending" && task.status !== "in_progress" && (
                    <div className="mt-3 pt-3 border-t border-white/5">
                      {task.output && (
                        <p className="text-sm text-slate-300">{task.output}</p>
                      )}
                      {task.error && (
                        <p className="text-sm text-red-400">{task.error}</p>
                      )}
                      {task.endTime && (
                        <p className="text-xs font-mono text-slate-600 mt-2">
                          Completed in {(task.endTime.getTime() - task.startTime.getTime())}ms
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
