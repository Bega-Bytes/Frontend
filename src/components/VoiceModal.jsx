import React, { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mic, X } from "lucide-react";

const COLORS = {
  primary: "#192B37",
  accent: "#F99C11",
  gray: "#47555F",
};

const CHAT_MAX_WIDTH_PX = 560;
const SHEET_MAX_WIDTH = "max-w-3xl";
const SHEET_HEIGHT = "h-[30%]";

/* ---------- speech ---------- */
function speak(text) {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1;
    u.pitch = 1;
    u.lang = "en-US";
    window.speechSynthesis?.speak(u);
  } catch {}
}
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

/* ---------- component ---------- */
export default function VoiceModal({ open, onClose, dispatchAction }) {
  const [phase, setPhase] = useState("idle");
  const [displayText, setDisplayText] = useState("");
  const [hintPulse, setHintPulse] = useState(false);

  const typeTimer = useRef(null);
  const mountedRef = useRef(false);
  const busyRef = useRef(false); // block re-entry while a preset is running

  const PRESETS = useRef({
    1: { text: "set climate off", action: "climate_turn_off", value: null },
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
    5: { text: "turn lights off", action: "lights_turn_off", value: null },
    6: { text: "set lights to 50", action: "lights_set", value: 50 },
    7: { text: "turn seat heat off", action: "seats_heat_off", value: null },
    8: { text: "set seat position to 3", action: "seats_adjust", value: 3 },
  }).current;

  /* ---------- lifecycle ---------- */
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (open) {
      setPhase("listening");
      setDisplayText("");
      setHintPulse(true);
      const t = setTimeout(
        () => mountedRef.current && setHintPulse(false),
        1800
      );
      return () => clearTimeout(t);
    } else {
      setPhase("idle");
      setDisplayText("");
      busyRef.current = false;
      if (typeTimer.current) {
        clearInterval(typeTimer.current);
        typeTimer.current = null;
      }
    }
  }, [open]);

  const finishAndDispatch = (action, value) => {
    // voice feedback
    speak(spokenFromAction(action, value));
    // close, then dispatch to App after a tiny delay so the sheet can animate out
    setTimeout(() => {
      if (!mountedRef.current) return;
      onClose?.();
      setTimeout(() => {
        dispatchAction?.(action, value);
        busyRef.current = false;
      }, 300);
    }, 600);
  };

  /* ---------- key handling (single global listener) ---------- */
  const startPreset = useCallback((preset) => {
    if (!mountedRef.current) return;
    setPhase("processing");
    setDisplayText("");

    // show first char immediately (fixes “first word missing”)
    const full = preset.text;
    let i = 1;
    setDisplayText(full.slice(0, 1));

    if (typeTimer.current) clearInterval(typeTimer.current);
    typeTimer.current = setInterval(() => {
      if (!mountedRef.current) {
        clearInterval(typeTimer.current);
        return;
      }
      setDisplayText(full.slice(0, i));
      i += 1;
      if (i > full.length) {
        clearInterval(typeTimer.current);
        typeTimer.current = null;
        finishAndDispatch(preset.action, preset.value);
      }
    }, 90);
  }, []);

  const keyHandler = useCallback(
    (e) => {
      if (!open) return;

      // close on Esc
      if (e.key === "Escape") {
        e.preventDefault();
        onClose?.();
        return;
      }

      // prevent auto-repeat (holding key down)
      if (e.repeat) return;

      // accept number keys from both layout-safe code and key value
      const digit =
        (e.code &&
          /^Digit[1-8]$/.test(e.code) &&
          e.code.replace("Digit", "")) ||
        (/^[1-8]$/.test(e.key) ? e.key : null);

      if (!digit) return;
      if (busyRef.current) return;

      const preset = PRESETS[digit];
      if (!preset) return;

      busyRef.current = true;
      startPreset(preset);
    },
    [open, onClose, startPreset, PRESETS]
  );

  useEffect(() => {
    if (!open) return;
    window.addEventListener("keydown", keyHandler, { capture: true });
    return () =>
      window.removeEventListener("keydown", keyHandler, { capture: true });
  }, [open, keyHandler]);

  /* ---------- UI ---------- */
  const ListeningLine = () => {
    const baseLineStyle = {
      borderColor: "rgba(255,255,255,0.22)",
      background: "rgba(255,255,255,0.06)",
      color: "rgba(255,255,255,0.9)",
      backdropFilter: "blur(4px)",
    };
    return (
      <div
        className="px-4 py-2 rounded-xl border text-sm leading-6 min-h-[40px] flex items-center"
        style={baseLineStyle}
      >
        {displayText.length === 0 ? (
          <span
            className={`transition ${hintPulse ? "opacity-100" : "opacity-80"}`}
          >
            Try: <b>"lights low"</b>, <b>"lights high"</b>, <b>"lights off"</b>,{" "}
            <b>"set volume to 50"</b>, <b>"set seat to 3"</b>
          </span>
        ) : (
          <span>
            {displayText}
            <span className="opacity-60"> ▌</span>
          </span>
        )}
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
                  className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg白/30 transition-colors"
                >
                  <X size={16} className="text-white" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-5 w-full flex justify-center">
                <div style={{ maxWidth: CHAT_MAX_WIDTH_PX }} className="w-full">
                  <ListeningLine />
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
