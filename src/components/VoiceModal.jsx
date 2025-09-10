import React, { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mic, X } from "lucide-react";

// Brand colors
const COLORS = {
  primary: "#192B37",
  accent: "#F99C11",
  secondary: "#F99C11",
  gray: "#47555F",
  lightBg: "#E8EAEB",
  neutralBg: "#D1D5D7",
  textSecondary: "#A3AAAF",
};

// Layout
const CHAT_MAX_WIDTH_PX = 560;
const SHEET_MAX_WIDTH = "max-w-3xl";
const SHEET_HEIGHT = "h-[30%]";

// ---- speech helper
function speak(text) {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1;
    u.pitch = 1;
    u.lang = "en-US";
    window.speechSynthesis?.speak(u);
  } catch {}
}

// turn an action/value into a short spoken sentence
function spokenFromAction(action, value) {
  switch (action) {
    case "climate_turn_off":
      return "Turning climate off.";
    case "climate_set_temperature":
      return `Setting temperature to ${value} degrees.`;
    case "infotainment_set_volume":
      return `Setting volume to ${value}.`;
    case "lights_turn_off":
      return "Turning lights off.";
    case "lights_set":
      return `Setting lights to ${value} percent.`;
    case "seats_heat_off":
      return "Turning seat heat off.";
    case "seats_adjust":
      return `Setting seat position to ${value}.`;
    default:
      return "Applying settings.";
  }
}

/**
 * VoiceModal (preset keys 1..8 + animated three-line “listening”)
 * Press 1..8 to trigger:
 *  1: climate off
 *  2: climate 28
 *  3: volume 30
 *  4: volume off
 *  5: lights off
 *  6: lights 50
 *  7: seat heat off
 *  8: seat pos 3
 */
export default function VoiceModal({ open, onClose, dispatchAction }) {
  const [phase, setPhase] = useState("idle");
  const [displayWords, setDisplayWords] = useState([]); // animated heard words
  const [hintPulse, setHintPulse] = useState(false);
  const wordsTimer = useRef(null);

  // Presets map
  const PRESETS = useRef({
    1: {
      text: 'lights off and "set climate off"',
      action: "climate_turn_off",
      value: null,
    },
    2: {
      text: "set climate to 28",
      action: "climate_set_temperature",
      value: 28,
    },
    3: {
      text: "set volume to 30",
      action: "infotainment_set_volume",
      value: 30,
    },
    4: { text: "set volume to 0", action: "infotainment_set_volume", value: 0 },
    5: { text: "lights off", action: "lights_turn_off", value: null },
    6: { text: "set lighting to 50", action: "lights_set", value: 50 },
    7: { text: "seat heat off", action: "seats_heat_off", value: null },
    8: { text: "set seat position to 3", action: "seats_adjust", value: 3 },
  }).current;

  // Open/close lifecycle
  useEffect(() => {
    if (open) {
      setPhase("listening");
      setDisplayWords([]);
      setHintPulse(true);
      const t = setTimeout(() => setHintPulse(false), 1800);
      return () => clearTimeout(t);
    } else {
      setPhase("idle");
      setDisplayWords([]);
      if (wordsTimer.current) {
        clearInterval(wordsTimer.current);
        wordsTimer.current = null;
      }
    }
  }, [open]);

  // Key handler (1..8 + Esc)
  const handleKey = useCallback(
    (e) => {
      if (!open) return;
      if (e.key === "Escape") {
        onClose?.();
        return;
      }
      if (!/^[1-8]$/.test(e.key)) return;

      const preset = PRESETS[e.key];
      if (!preset) return;

      // start typewriter “heard” animation
      setPhase("processing");
      setDisplayWords([]);
      const words = preset.text.split(" ");
      let i = 0;

      wordsTimer.current && clearInterval(wordsTimer.current);
      wordsTimer.current = setInterval(() => {
        setDisplayWords((prev) => [...prev, words[i]]);
        i += 1;
        if (i >= words.length) {
          clearInterval(wordsTimer.current);
          wordsTimer.current = null;

          // Speak the action
          const say = spokenFromAction(preset.action, preset.value);
          speak(say);

          // short pause so the user hears it, then close & dispatch
          setTimeout(() => {
            onClose?.();
            setTimeout(() => {
              dispatchAction?.(preset.action, preset.value);
            }, 300);
          }, 600);
        }
      }, 140); // slower per your last tweak
    },
    [open, onClose, dispatchAction, PRESETS]
  );

  useEffect(() => {
    if (!open) return;
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, handleKey]);

  // Three stacked listening “lines”
  const ListeningLines = () => {
    const baseLineStyle = {
      borderColor: "rgba(255,255,255,0.22)",
      background: "rgba(255,255,255,0.06)",
      color: "rgba(255,255,255,0.8)",
      backdropFilter: "blur(4px)",
    };

    return (
      <div className="space-y-2">
        {/* Line 1: shows heard words */}
        <div
          className="px-4 py-2 rounded-xl border text-sm leading-6 min-h-[40px] flex items-center"
          style={baseLineStyle}
        >
          {displayWords.length === 0 ? (
            <span
              className={`transition ${
                hintPulse ? "opacity-100" : "opacity-80"
              }`}
            >
              Try: <b>"lights low"</b>, <b>"lights high"</b>,{" "}
              <b>"lights off"</b>, <b>"set volume to 50"</b>,{" "}
              <b>"set seat to 3"</b>
            </span>
          ) : (
            <span>
              {displayWords.join(" ")}
              <span className="opacity-60"> ▌</span>
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: "rgba(0,0,0,0.35)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
            }}
            onClick={() => onClose?.()}
          />

          {/* Bottom sheet 30% */}
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
                duration: 0.3,
              }}
            >
              {/* Header */}
              <div className="flex justify-between items-center p-5 border-b border-white/10 w-full">
                <div className="flex items-center gap-3 mx-auto">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: COLORS.accent }}
                  >
                    <Mic size={16} className="text-white" />
                  </div>
                  <p className="text-white/80 font-bold text-m">
                    {phase === "listening"
                      ? "Listening..."
                      : phase === "processing"
                      ? "Thinking..."
                      : "Ready"}
                  </p>
                </div>
                <button
                  onClick={() => onClose?.()}
                  className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X size={16} className="text-white" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-5 w-full flex justify-center">
                <div style={{ maxWidth: CHAT_MAX_WIDTH_PX }} className="w-full">
                  <ListeningLines />
                </div>
              </div>

              <div className="h-1" />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
