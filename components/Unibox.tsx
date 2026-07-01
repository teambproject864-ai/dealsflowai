"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Phone,
  Video,
  Mic,
  MicOff,
  VideoOff,
  X,
  Send,
  Loader2,
  FileText,
  Settings,
  Users,
  Upload,
  XCircle,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { FileAttachment } from "@/lib/types";

type UniboxTab = "chat" | "call";

export function Unibox() {
  const [activeTab, setActiveTab] = useState<UniboxTab>("chat");
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const customerName = "Demo Customer";
  const customerInitials = "DC";

  // Poll chat messages
  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/portal/chat?sessionId=session-1");
      const data = await res.json();
      if (data.success) {
        setChatMessages(data.messages);
      }
    } catch (err) {
      console.error("[Unibox] Failed to fetch chat messages:", err);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    setIsSending(true);
    try {
      const res = await fetch("/api/portal/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: "session-1",
          content: chatInput,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setChatInput("");
        fetchMessages();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const tabs = [
    { id: "chat" as const, label: "Chat", icon: MessageSquare },
    { id: "call" as const, label: "Call", icon: Phone },
  ];

  if (!isOpen) {
    return (
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[100] bg-gradient-to-br from-teal-600 to-teal-550 hover:from-teal-550 hover:to-teal-500 text-white p-4 rounded-full shadow-xl shadow-teal-600/30 transition-all hover:scale-105 active:scale-95"
      >
        <MessageSquare className="h-6 w-6" />
      </motion.button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-[380px] md:w-[450px] h-[600px] bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-slate-800/80 border-b border-white/10 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 border border-teal-500/50">
                  <AvatarFallback className="bg-teal-600">{customerInitials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-white font-semibold text-sm">{customerName}</p>
                  <p className="text-teal-400 text-xs flex items-center gap-1">
                    <span className="h-1.5 w-1.5 bg-teal-400 rounded-full animate-pulse" />
                    Online
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(true)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <Settings className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 px-3 pt-2 bg-slate-900/50">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all",
                      activeTab === tab.id
                        ? "bg-slate-700 text-white shadow-sm"
                        : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden">
              {activeTab === "chat" && (
                <div className="flex flex-col h-full">
                  <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                    <div className="space-y-4">
                      {chatMessages.map((msg) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, x: msg.senderRole === "agent" ? 10 : -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={cn(
                            "flex",
                            msg.senderRole === "agent" ? "justify-end" : "justify-start"
                          )}
                        >
                          <div
                            className={cn(
                              "max-w-[80%] p-3 rounded-xl text-sm",
                              msg.senderRole === "agent"
                                ? "bg-teal-600 text-white rounded-tr-none"
                                : "bg-slate-700 text-slate-100 rounded-tl-none"
                            )}
                          >
                            <p className="font-semibold text-[10px] mb-1 opacity-80">
                              {msg.senderName}
                            </p>
                            {msg.content && <p className="leading-relaxed">{msg.content}</p>}
                            <p className="text-[10px] mt-1 opacity-70 text-right">
                              {new Date(msg.createdAt || msg.timestamp || "").toLocaleTimeString(undefined, {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                      {isSending && (
                        <div className="flex justify-end">
                          <div className="bg-slate-700 p-3 rounded-xl rounded-tr-none flex items-center gap-2">
                            <Loader2 className="h-3 w-3 animate-spin text-slate-300" />
                            <p className="text-xs text-slate-300">Sending...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  <form
                    onSubmit={handleSendMessage}
                    className="border-t border-white/10 p-3 flex gap-2"
                  >
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Type a message..."
                      className="bg-slate-800/80 border-white/10 focus:border-teal-500/50 flex-1"
                      disabled={isSending}
                    />
                    <Button
                      type="submit"
                      disabled={isSending || !chatInput.trim()}
                      className="bg-teal-600 hover:bg-teal-550 disabled:opacity-50"
                    >
                      {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </form>
                </div>
              )}

              {activeTab === "call" && (
                <div className="p-6 flex flex-col items-center justify-center h-full gap-8">
                  {!isCallActive ? (
                    <>
                      <div className="h-32 w-32 rounded-full bg-gradient-to-br from-teal-500/20 to-slate-700 border border-teal-500/30 flex items-center justify-center">
                        <Users className="h-16 w-16 text-teal-400" />
                      </div>
                      <div className="text-center space-y-2">
                        <p className="text-white font-semibold text-lg">Start a Call</p>
                        <p className="text-slate-400 text-sm">Connect with the customer via voice or video</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
                        <Button
                          onClick={() => setIsCallActive(true)}
                          className="bg-teal-600 hover:bg-teal-500 h-12 gap-2"
                        >
                          <Phone className="h-4 w-4" />
                          Voice Call
                        </Button>
                        <Button
                          onClick={() => { setIsCallActive(true); setIsVideoOff(false); }}
                          variant="outline"
                          className="border-slate-600 hover:bg-slate-700/50 h-12 gap-2"
                        >
                          <Video className="h-4 w-4" />
                          Video Call
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="h-40 w-40 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center">
                        <Avatar className="h-32 w-32 border-2 border-teal-500/50">
                          <AvatarFallback className="bg-teal-600 text-4xl">{customerInitials}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="text-center space-y-2">
                        <p className="text-white font-semibold text-lg">Call Active</p>
                        <p className="text-slate-400 text-sm">Connected to {customerName}</p>
                      </div>

                      <div className="flex items-center gap-4">
                        <Button
                          onClick={() => setIsMuted(!isMuted)}
                          variant="outline"
                          className={cn(
                            "h-14 w-14 rounded-full border-slate-600 hover:bg-slate-700/50",
                            isMuted ? "bg-red-600/20 border-red-600 text-red-400" : ""
                          )}
                        >
                          {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                        </Button>

                        <Button
                          onClick={() => setIsCallActive(false)}
                          className="h-16 w-16 rounded-full bg-red-600 hover:bg-red-500"
                        >
                          <X className="h-6 w-6" />
                        </Button>

                        <Button
                          onClick={() => setIsVideoOff(!isVideoOff)}
                          variant="outline"
                          className={cn(
                            "h-14 w-14 rounded-full border-slate-600 hover:bg-slate-700/50",
                            isVideoOff ? "bg-red-600/20 border-red-600 text-red-400" : ""
                          )}
                        >
                          {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isMinimized && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 bg-slate-800/95 border border-white/10 px-4 py-3 rounded-full shadow-xl"
        >
          <Avatar className="h-8 w-8 border border-teal-500/50">
            <AvatarFallback className="bg-teal-600">{customerInitials}</AvatarFallback>
          </Avatar>
          <p className="text-white text-sm font-medium">{customerName}</p>
          <button
            onClick={() => setIsMinimized(false)}
            className="ml-2 text-slate-400 hover:text-white transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
}
