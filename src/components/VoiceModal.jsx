import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mic, X, TestTube, Shuffle } from "lucide-react";
import { SpeechSimulation } from "../services/speechSimulation"

// Dava Brand Colors
const COLORS = {
  primary: "#192B37",
  accent: "#F99C11",
  secondary: "#F99C11",
  gray: "#47555F",
  lightBg: "#E8EAEB",
  neutralBg: "#D1D5D7",
  textSecondary: "#A3AAAF",
};

const speechSim = new SpeechSimulation();

// Test commands for quick testing
const testCommands = [
    "Set temperature to 24 degrees",
    "Turn up the volume",
    "Turn on the lights", 
    "Heat the seats",
    "Play some music",
    "Make it cooler",
    "Dim the lights",
    "Stop the music",
    "Volume to 50",
    "Turn off climate control",
    "Brighten the lights",
    "Set temperature to 18"
];

// --- TUNABLE UI KNOBS ---
const CHAT_MAX_WIDTH_PX = 560;
const SHEET_MAX_WIDTH = "max-w-3xl";
const SHEET_HEIGHT = "h-[60%]";

const QuickTestButtons = ({ onTestCommand, onRandomCommand, onCorruptedCommand }) => (
    <div className="border-t border-white/10 p-4">
        <div className="flex justify-between items-center mb-3">
            <p className="text-white/70 text-sm font-medium">Quick Test Commands:</p>
            <div className="flex gap-2">
                <button
                    onClick={onRandomCommand}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-200 hover:bg-purple-500/30 transition-colors"
                >
                    <Shuffle size={12} />
                    Random
                </button>
                <button
                    onClick={onCorruptedCommand}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-orange-500/20 text-orange-200 hover:bg-orange-500/30 transition-colors"
                >
                    <TestTube size={12} />
                    Corrupted
                </button>
            </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
            {testCommands.slice(0, 8).map((cmd, i) => (
                <button
                    key={i}
                    onClick={() => onTestCommand(cmd)}
                    className="text-xs px-3 py-2 rounded-lg bg-white/10 text-white/80 hover:bg-white/20 transition-colors text-left truncate"
                    title={cmd}
                >
                    {cmd}
                </button>
            ))}
        </div>
    </div>
);

export default function VoiceModal({ open, onClose, dispatchAction, onNavigate }) {
  const [phase, setPhase] = useState("idle");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [log, setLog] = useState([]);
  const inputRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [log]);

  useEffect(() => {
    if (open) {
      setPhase("listening");
      setLog([]);
      setInput("");
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      try {
        window.speechSynthesis?.cancel();
      } catch {}
      setPhase("idle");
    }
  }, [open]);

  const speak = (text) => {
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.lang = "en-US";
      window.speechSynthesis?.speak(utterance);
    } catch (error) {
      console.log("Speech synthesis not available");
    }
  };

  const parseCommand = async (text) => {
    try {
        console.log('🎯 Parsing command:', text);
        
        // Send to backend API (replace with your actual backend URL)
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
        const response = await fetch(`${backendUrl}/api/nlp/process-voice`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: text,
                timestamp: Date.now()
            })
        });
        
        if (!response.ok) {
            throw new Error(`Backend error: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('🎯 Backend result:', result);
        
        if (result.confidence > 0.6) {
            return {
                action: result.action,
                value: result.parameters,
                response: `✅ ${generateResponseText(result.action, result.parameters)} (${(result.confidence * 100).toFixed(0)}% confident)`,
                confidence: result.confidence,
                success: true
            };
        } else {
            return {
                action: null,
                response: `🤔 I'm not sure about that command (${(result.confidence * 100).toFixed(0)}% confidence). Could you try rephrasing?`,
                confidence: result.confidence,
                success: false
            };
        }
    } catch (error) {
        console.error('❌ Voice parsing error:', error);
        
        // Fallback to local parsing for development
        return parseCommandLocal(text);
    }
  };

  function generateResponseText(action, parameters) {
      const responses = {
          'climate_set_temperature': `Setting temperature to ${parameters.temperature}°C`,
          'climate_turn_on': 'Turning on climate control',
          'infotainment_set_volume': `Setting volume to ${parameters.volume}%`,
          'lights_turn_on': 'Turning on interior lights',
          'seats_heat_on': 'Activating seat heating',
          // ... more responses
      };
      
      return responses[action] || 'Command executed successfully';
  }

  const handleSend = () => {
    if (!input.trim() || sending) return;

    setSending(true);
    setPhase("processing");

    const userMessage = { role: "user", text: input.trim(), id: Date.now() };
    setLog((prevLog) => [...prevLog, userMessage]);

    const currentInput = input.trim();
    setInput("");

    setTimeout(() => {
      const command = parseCommand(currentInput);

      if (!command.action) {
        const aiMessage = { role: "ai", text: command.response, id: Date.now() + Math.random() };
        setLog((prevLog) => [...prevLog, aiMessage]);
        speak(command.response);
        setPhase("listening");
        setSending(false);
        return;
      }

      const aiMessage = { role: "ai", text: command.response, id: Date.now() + Math.random() };
      setLog((prevLog) => [...prevLog, aiMessage]);
      speak(command.response);

      try {
        dispatchAction?.(command.action, command.value);
      } catch (error) {
        console.error("Action dispatch failed:", error);
      }

      if (onNavigate && command.page) {
        setTimeout(() => onNavigate(command.page), 400);
      }

      setPhase("listening");
      setSending(false);
    }, 300);
  };

  useEffect(() => {
    if (!open) return;

    const handleKeydown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      } else if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [open, input, sending]);

  const VoiceWave = () => (
    <div className="flex items-center justify-center gap-1 h-16">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full"
          style={{ backgroundColor: COLORS.accent }}
          animate=
            {phase === "listening"
              ? { height: ["4px", "32px", "4px"], opacity: [0.4, 1, 0.4] }
              : phase === "processing"
              ? { height: ["8px", "20px", "8px"], opacity: [0.6, 0.9, 0.6] }
              : { height: "4px", opacity: 0.3 }}
          transition={{
            duration: phase === "listening" ? 1.5 : 1,
            repeat: phase === "listening" || phase === "processing" ? Infinity : 0,
            delay: i * 0.1,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );

  const ChatBubble = ({ message, isUser }) => (
    <motion.div
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"} mb-3`}
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 240, damping: 22, duration: 0.35 }}
    >
      <div
        className={`max-w-[72%] px-4 py-3 rounded-2xl shadow-md ${
          isUser
            ? "rounded-br-lg text-white"
            : "rounded-bl-lg text-gray-900 bg-white border border-gray-200"
        }`}
        style={{ backgroundColor: isUser ? COLORS.accent : undefined }}
      >
        <p className="text-[15px] leading-6 font-medium antialiased">{message.text}</p>
      </div>
    </motion.div>
  );

  return (
    <AnimatePresence mode="wait">
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: "rgba(0,0,0,0.35)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
            }}
            onClick={() => {
              try {
                window.speechSynthesis?.cancel();
              } catch {}
              onClose?.();
            }}
          />

          <div className="relative flex flex-col justify-end h-full w-full">
            <motion.div
              className={`${SHEET_HEIGHT} w-full ${SHEET_MAX_WIDTH} mx-auto flex flex-col backdrop-blur-sm border border-white/10 rounded-t-3xl items-center shadow-2xl`}
              style={{ backgroundColor: "rgba(0,0,0,0.2)" }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30, duration: 0.35 }}
            >
              <motion.div
                className="flex justify-between items-center p-6 border-b border-white/10 w-full"
                initial={{ y: -16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.08 }}
              >
                <div className="flex items-center gap-3 mx-auto">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.accent }}>
                    <Mic size={16} className="text-white" />
                  </div>
                  <div>
                
                    <p className="text-white/80 font-bold text-m">
                      {phase === "listening" ? "Listening..." : phase === "processing" ? "Thinking..." : "Ready"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    try {
                      window.speechSynthesis?.cancel();
                    } catch {}
                    onClose?.();
                  }}
                  className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X size={16} className="text-white" />
                </button>
              </motion.div>

              <motion.div
                className="px-6 border-b border-white/10 w-full flex justify-center"
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.16 }}
              >
                <VoiceWave />
              </motion.div>

              <div className="flex-1 px-5 py-4 overflow-hidden w-full flex justify-center">
                <div
                  className="h-full overflow-y-auto w-full"
                  style={{ maxWidth: CHAT_MAX_WIDTH_PX }}
                >
                  {log.length === 0 ? (
                    <motion.div className="text-center py-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                      <p className="text-white/80 text-sm leading-relaxed">
                        Try commands like:<br />"Set temperature to 22"<br />"Turn up the volume"<br />"Turn on the lights"
                      </p>
                    </motion.div>
                  ) : (
                    <div className="space-y-2">
                      {log.map((message) => (
                        <ChatBubble key={message.id} message={message} isUser={message.role === "user"} />
                      ))}
                      <div ref={chatEndRef} />
                    </div>
                  )}
                </div>
              </div>

              <motion.div
                className="p-5 border-t border-white/10 w-full flex justify-center"
                initial={{ y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.24 }}
              >
                <div className="flex gap-3 w-full" style={{ maxWidth: CHAT_MAX_WIDTH_PX }}>
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your command..."
                    className="flex-1 px-4 py-3 rounded-xl bg-white text-[#192B37] placeholder-gray-500 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3DD17B] focus:border-transparent transition-all duration-200"
                    disabled={sending}
                  />
                  <motion.button
                    onClick={handleSend}
                    disabled={sending || !input.trim()}
                    className="px-5 py-3 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-50"
                    style={{ backgroundColor: COLORS.accent }}
                    whileHover={!sending && input.trim() ? { scale: 1.03 } : {}}
                    whileTap={!sending && input.trim() ? { scale: 0.97 } : {}}
                  >
                    Send
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}