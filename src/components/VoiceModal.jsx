import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mic, X } from "lucide-react";

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

// --- TUNABLE UI KNOBS ---
const CHAT_MAX_WIDTH_PX = 560;
const SHEET_MAX_WIDTH = "max-w-3xl";
const SHEET_HEIGHT = "h-[60%]";

export default function VoiceModal({
  open,
  onClose,
  dispatchAction,
  onNavigate,
}) {
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

  const parseCommand = (text) => {
    const s = text.toLowerCase().trim();

    const volumeMatch = s.match(/(?:set\s+)?volume\s*(?:to\s+)?(\d+)/);
    if (volumeMatch) {
      const vol = Math.min(100, Math.max(0, parseInt(volumeMatch[1])));
      return {
        action: "media_set_volume",
        value: vol,
        response: `Setting volume to ${vol}%`,
      };
    }
    if (s.includes("volume up") || s.includes("turn up")) {
      return {
        action: "media_volume_up",
        value: 10,
        response: "Turning volume up",
      };
    }
    if (s.includes("volume down") || s.includes("turn down")) {
      return {
        action: "media_volume_down",
        value: 10,
        response: "Turning volume down",
      };
    }

    const tempMatch = s.match(/(?:set\s+)?temperature\s*(?:to\s+)?(\d+)/);
    if (tempMatch) {
      const temp = Math.min(30, Math.max(16, parseInt(tempMatch[1])));
      return {
        action: "climate_set_temperature",
        value: temp,
        response: `Setting temperature to ${temp}°C`,
      };
    }
    if (
      s.includes("warmer") ||
      s.includes("heat up") ||
      s.includes("temperature up")
    ) {
      return {
        action: "climate_increase",
        value: 2,
        response: "Increasing temperature",
      };
    }
    if (
      s.includes("cooler") ||
      s.includes("cool down") ||
      s.includes("temperature down")
    ) {
      return {
        action: "climate_decrease",
        value: 2,
        response: "Decreasing temperature",
      };
    }

    if (s.includes("turn on") && s.includes("climate")) {
      return {
        action: "climate_turn_on",
        value: null,
        response: "Turning on climate control",
      };
    }
    if (s.includes("turn off") && s.includes("climate")) {
      return {
        action: "climate_turn_off",
        value: null,
        response: "Turning off climate control",
      };
    }
    if (s.includes("turn on") && (s.includes("music") || s.includes("media"))) {
      return {
        action: "media_turn_on",
        value: null,
        response: "Starting music",
      };
    }
    if (
      s.includes("turn off") &&
      (s.includes("music") || s.includes("media"))
    ) {
      return {
        action: "media_turn_off",
        value: null,
        response: "Stopping music",
      };
    }
    if (s.includes("turn on") && s.includes("lights")) {
      return {
        action: "lights_turn_on",
        value: null,
        response: "Turning on lights",
      };
    }
    if (s.includes("turn off") && s.includes("lights")) {
      return {
        action: "lights_turn_off",
        value: null,
        response: "Turning off lights",
      };
    }

    const seatMatch = s.match(
      /(?:set\s+)?seat\s*(?:position\s*)?(?:to\s+)?(\d+)/
    );
    if (seatMatch) {
      const pos = Math.min(5, Math.max(1, parseInt(seatMatch[1])));
      return {
        action: "seats_adjust",
        value: pos,
        response: `Adjusting seat to position ${pos}`,
      };
    }
    if (s.includes("seat") && (s.includes("heat") || s.includes("heating"))) {
      if (s.includes("on") || s.includes("start")) {
        return {
          action: "seats_heat_on",
          value: null,
          response: "Turning on seat heating",
        };
      }
      if (s.includes("off") || s.includes("stop")) {
        return {
          action: "seats_heat_off",
          value: null,
          response: "Turning off seat heating",
        };
      }
    }

    return {
      action: null,
      value: null,
      response:
        "I didn't understand that command. Try something like 'set temperature to 22' or 'turn up volume'.",
    };
  };

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
        const aiMessage = {
          role: "ai",
          text: command.response,
          id: Date.now() + Math.random(),
        };
        setLog((prevLog) => [...prevLog, aiMessage]);
        speak(command.response);
        setPhase("listening");
        setSending(false);
        return;
      }

      const aiMessage = {
        role: "ai",
        text: command.response,
        id: Date.now() + Math.random(),
      };
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
          animate={
            phase === "listening"
              ? { height: ["4px", "32px", "4px"], opacity: [0.4, 1, 0.4] }
              : phase === "processing"
              ? { height: ["8px", "20px", "8px"], opacity: [0.6, 0.9, 0.6] }
              : { height: "4px", opacity: 0.3 }
          }
          transition={{
            duration: phase === "listening" ? 1.5 : 1,
            repeat:
              phase === "listening" || phase === "processing" ? Infinity : 0,
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
      transition={{
        type: "spring",
        stiffness: 240,
        damping: 22,
        duration: 0.35,
      }}
    >
      <div
        className={`max-w-[72%] px-4 py-3 rounded-2xl shadow-md ${
          isUser
            ? "rounded-br-lg text-white"
            : "rounded-bl-lg text-gray-900 bg-white border border-gray-200"
        }`}
        style={{ backgroundColor: isUser ? COLORS.accent : undefined }}
      >
        <p className="text-[15px] leading-6 font-medium antialiased">
          {message.text}
        </p>
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
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                duration: 0.35,
              }}
            >
              <motion.div
                className="flex justify-between items-center p-6 border-b border-white/10 w-full"
                initial={{ y: -16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.08 }}
              >
                <div className="flex items-center gap-3 mx-auto">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: COLORS.accent }}
                  >
                    <Mic size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white/80 font-bold text-m">
                      {phase === "listening"
                        ? "Listening..."
                        : phase === "processing"
                        ? "Thinking..."
                        : "Ready"}
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
                    <motion.div
                      className="text-center py-8"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <p className="text-white/80 text-sm leading-relaxed">
                        Try commands like:
                        <br />
                        "Set temperature to 22"
                        <br />
                        "Turn up the volume"
                        <br />
                        "Turn on the lights"
                      </p>
                    </motion.div>
                  ) : (
                    <div className="space-y-2">
                      {log.map((message) => (
                        <ChatBubble
                          key={message.id}
                          message={message}
                          isUser={message.role === "user"}
                        />
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
                <div
                  className="flex gap-3 w-full"
                  style={{ maxWidth: CHAT_MAX_WIDTH_PX }}
                >
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
