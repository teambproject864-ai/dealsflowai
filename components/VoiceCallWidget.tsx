"use client";

import { useEffect, useState } from "react";
import { Phone, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BookingWidget } from "@/components/BookingWidget";

export function VoiceCallWidget() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-voice-call", handleOpen);
    return () => window.removeEventListener("open-voice-call", handleOpen);
  }, []);

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05, y: -2 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-24 right-8 bg-teal-500 hover:bg-teal-400 text-black p-4 rounded-full shadow-lg z-50 flex items-center justify-center border border-teal-300/30 group"
            aria-label="Schedule a Voice Call"
          >
            <span className="absolute -left-36 top-1/2 -translate-y-1/2 bg-slate-900 border border-white/10 text-slate-200 text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
              📞 Book Strategy Voice Call
            </span>
            <Phone className="h-6 w-6 animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Glassmorphic Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            {/* Background Closer */}
            <div className="absolute inset-0 cursor-pointer" onClick={() => setIsOpen(false)} />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-slate-950/95 backdrop-blur-xl shadow-2xl z-10"
            >
              {/* Header inside modal */}
              <div className="absolute top-4 right-4 z-50">
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close scheduler"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Booking Widget Wrapper */}
              <div className="p-1">
                <BookingWidget
                  name=""
                  email=""
                  companyName=""
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
