"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, Trash2, Shield, Info, AlertTriangle, Cpu } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  type: "info" | "success" | "warning" | "alert";
  time: string;
  unread: boolean;
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "GTM Roadmap Generated",
    description: "Acme Corp GTM alignment analysis finished successfully.",
    type: "success",
    time: "2m ago",
    unread: true,
  },
  {
    id: "notif-2",
    title: "Shield Triggered",
    description: "Clawpatrol blocked a malicious prompt injection attempt.",
    type: "alert",
    time: "15m ago",
    unread: true,
  },
  {
    id: "notif-3",
    title: "Hermes OS Sync",
    description: "Memory consolidation complete. 42 entries consolidated to LTM.",
    type: "info",
    time: "1h ago",
    unread: false,
  },
  {
    id: "notif-4",
    title: "Rate Limit Warning",
    description: "Email automation agent is approaching outbound limit.",
    type: "warning",
    time: "4h ago",
    unread: false,
  },
];

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize notifications from localStorage or fallback to mock
  useEffect(() => {
    const saved = localStorage.getItem("df_notifications");
    if (saved) {
      try {
        setNotifications(JSON.parse(saved));
      } catch (e) {
        setNotifications(MOCK_NOTIFICATIONS);
      }
    } else {
      setNotifications(MOCK_NOTIFICATIONS);
    }
  }, []);

  // Save changes to local storage
  const saveNotifs = (updated: NotificationItem[]) => {
    setNotifications(updated);
    localStorage.setItem("df_notifications", JSON.stringify(updated));
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllRead = () => {
    const updated = notifications.map(n => ({ ...n, unread: false }));
    saveNotifs(updated);
  };

  const toggleRead = (id: string) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, unread: !n.unread } : n
    );
    saveNotifs(updated);
  };

  const deleteNotif = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notifications.filter(n => n.id !== id);
    saveNotifs(updated);
  };

  const clearAll = () => {
    saveNotifs([]);
  };

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "success":
        return <Cpu className="h-4 w-4 text-emerald-400" />;
      case "alert":
        return <Shield className="h-4 w-4 text-red-400 animate-pulse" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-400" />;
      default:
        return <Info className="h-4 w-4 text-teal-400" />;
    }
  };

  return (
    <div ref={containerRef} className="relative z-40">
      {/* Bell Trigger Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-xl border transition-all ${
          isOpen
            ? "border-teal-500/30 bg-teal-500/10 text-teal-300 shadow-[0_0_15px_rgba(20,184,166,0.2)]"
            : "border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 hover:border-white/20"
        }`}
        aria-label="View notifications"
      >
        <Bell className="h-4.5 w-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-teal-500 text-[9px] font-bold text-slate-950 ring-2 ring-[#060612]">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-white/10 bg-[#090918]/95 backdrop-blur-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-white">Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold">
                    {unreadCount} New
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 font-medium transition-colors"
                  >
                    <Check className="h-3.5 w-3.5" /> Mark all read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-medium transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Clear all
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-[300px] overflow-y-auto divide-y divide-white/5">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500">
                  <Bell className="h-8 w-8 text-slate-600 mb-2 opacity-50" />
                  <p className="text-sm">All caught up!</p>
                  <p className="text-xs text-slate-600 mt-1">No new system alerts.</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => toggleRead(notif.id)}
                    className={`relative p-4 flex gap-3 transition-colors cursor-pointer group hover:bg-white/[0.03] ${
                      notif.unread ? "bg-white/[0.01]" : ""
                    }`}
                  >
                    {/* Unread indicator bar */}
                    {notif.unread && (
                      <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-teal-400" />
                    )}

                    <div className={`p-2 rounded-xl h-fit border border-white/5 bg-white/5`}>
                      {getIcon(notif.type)}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold ${notif.unread ? "text-white" : "text-slate-400"}`}>
                          {notif.title}
                        </span>
                        <span className="text-[9px] text-slate-500">{notif.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-normal line-clamp-2">
                        {notif.description}
                      </p>
                    </div>

                    <button
                      onClick={(e) => deleteNotif(notif.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-white/15 text-slate-400 hover:text-red-400 transition-all self-center"
                      aria-label="Delete notification"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
