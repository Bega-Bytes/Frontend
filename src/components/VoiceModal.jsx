import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mic, X, Play } from "lucide-react";

/**
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 *  - dispatchAction: (action: string, value?: number|string) => void
 *  - onNavigate?: (kind: "climate"|"music"|"lighting"|"seats") => void   // optional
 */
export default function VoiceModal({
  open,
  onClose,
  dispatchAction,
  onNavigate,
}) {
  const [phase, setPhase] = useState("idle"); // idle | listening | processing
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [log, setLog] = useState([]); // [{role: 'user'|'ai', text: string}]
  const inputRef = useRef(null);

  // focus field when opened
  useEffect(() => {
    if (open) {
      setPhase("listening");
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      // stop any speech
      try {
        window.speechSynthesis?.cancel();
      } catch {}
      setPhase("idle");
    }
  }, [open]);

  // simple chime
  const chime = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = 880;
      o.connect(g);
      g.connect(ctx.destination);
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
      o.start();
      o.stop(ctx.currentTime + 0.26);
    } catch {}
  };

  const speak = (text) => {
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1;
      u.pitch = 1;
      u.lang = "en-US";
      window.speechSynthesis?.speak(u);
    } catch {}
  };

  // very small parser → (action, value, page)
  const parse = (t) => {
    const s = t.toLowerCase();

    // volume (0-100)
    const volNum = s.match(/volume\s*(to|at)?\s*(\d{1,3})/);
    if (volNum) {
      const v = Math.max(0, Math.min(100, parseInt(volNum[2], 10)));
      return {
        action: "infotainment_set_volume",
        value: v,
        page: "music",
        say: `Setting volume to ${v}%`,
      };
    }
    if (/volume.*up|turn.*music.*up/.test(s)) {
      return {
        action: "infotainment_volume_up",
        value: null,
        page: "music",
        say: "Turning volume up",
      };
    }
    if (/volume.*down|turn.*music.*down/.test(s)) {
      return {
        action: "infotainment_volume_down",
        value: null,
        page: "music",
        say: "Turning volume down",
      };
    }

    // climate temperature 16–30
    const tempNum = s.match(
      /(temp|temperature|climate).*?(to|at)?\s*(\d{1,2})/
    );
    if (tempNum) {
      const v = Math.max(16, Math.min(30, parseInt(tempNum[3], 10)));
      return {
        action: "climate_set_temperature",
        value: v,
        page: "climate",
        say: `Setting cabin temperature to ${v}°C`,
      };
    }
    if (/climate.*(on|start)/.test(s)) {
      return {
        action: "climate_turn_on",
        value: null,
        page: "climate",
        say: "Turning climate on",
      };
    }
    if (/climate.*(off|stop)/.test(s)) {
      return {
        action: "climate_turn_off",
        value: null,
        page: "climate",
        say: "Turning climate off",
      };
    }
    if (/warmer|increase temperature|hotter/.test(s)) {
      return {
        action: "climate_increase",
        value: null,
        page: "climate",
        say: "Increasing temperature",
      };
    }
    if (/cooler|decrease temperature|colder/.test(s)) {
      return {
        action: "climate_decrease",
        value: null,
        page: "climate",
        say: "Decreasing temperature",
      };
    }

    // lights
    if (/lights.*(on|start)/.test(s)) {
      return {
        action: "lights_turn_on",
        value: null,
        page: "lighting",
        say: "Turning lights on",
      };
    }
    if (/lights.*(off|stop)/.test(s)) {
      return {
        action: "lights_turn_off",
        value: null,
        page: "lighting",
        say: "Turning lights off",
      };
    }
    if (/lights.*(dim|lower|down)/.test(s)) {
      return {
        action: "lights_dim",
        value: null,
        page: "lighting",
        say: "Dimming lights",
      };
    }
    if (/lights.*(bright|raise|up)/.test(s)) {
      return {
        action: "lights_brighten",
        value: null,
        page: "lighting",
        say: "Brightening lights",
      };
    }

    // seats
    if (/seat heat.*(on|start)/.test(s)) {
      return {
        action: "seats_heat_on",
        value: null,
        page: "seats",
        say: "Seat heating on",
      };
    }
    if (/seat heat.*(off|stop)/.test(s)) {
      return {
        action: "seats_heat_off",
        value: null,
        page: "seats",
        say: "Seat heating off",
      };
    }
    const pos = s.match(/seat.*(position)?\s*(\d)/);
    if (pos) {
      const v = Math.max(1, Math.min(5, parseInt(pos[2], 10)));
      return {
        action: "seats_adjust",
        value: v,
        page: "seats",
        say: `Setting seat to position ${v}`,
      };
    }

    // exit phrases
    if (/^(goodbye|bye|close|dismiss)\b/.test(s)) {
      return { action: "__close__", value: null, page: null, say: "Goodbye" };
    }

    return null;
  };

  const handleSend = () => {
    if (!input.trim() || sending) return;
    setSending(true);

    const userText = input.trim();
    setLog((l) => [...l, { role: "user", text: userText }]);
    setInput(""); // clear immediately
    chime();

    const plan = parse(userText);

    if (!plan) {
      const msg = "Sorry, I didn't get that.";
      setLog((l) => [...l, { role: "ai", text: msg }]);
      speak(msg);
      setPhase("listening");
      setSending(false);
      return;
    }

    if (plan.action === "__close__") {
      speak(plan.say);
      setLog((l) => [...l, { role: "ai", text: plan.say }]);
      setTimeout(() => {
        setSending(false);
        onClose?.();
      }, 500);
      return;
    }

    // narrate plan into the transcript BEFORE executing
    setLog((l) => [
      ...l,
      { role: "ai", text: plan.say },
      plan.value !== null && plan.value !== undefined
        ? { role: "ai", text: `Action: ${plan.action} (${plan.value})` }
        : { role: "ai", text: `Action: ${plan.action}` },
    ]);
    speak(plan.say);

    // execute
    try {
      dispatchAction?.(plan.action, plan.value);
    } catch {}

    // optionally open the relevant sheet/page so the user sees it live
    if (onNavigate && plan.page) {
      setTimeout(() => onNavigate(plan.page), 300);
    }

    // done
    setPhase("listening");
    setSending(false);
  };

  // esc to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "Enter") handleSend();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, input, sending]);

  return (
    <AnimatePresence initial={false} mode="wait">
      {open && (
        <motion.div
          key="va-backdrop"
          className="absolute inset-0 z-[80] grid place-items-center bg-black/50 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              try {
                window.speechSynthesis?.cancel();
              } catch {}
              onClose?.();
            }
          }}
        >
          <motion.div
            key="va-panel"
            className="w-[720px] max-w-[92vw] rounded-3xl p-6 border border-white/12 bg-[rgba(37,36,36,0.52)]"
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 18, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
          >
            {/* header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full grid place-items-center bg-[var(--brand)]">
                  <Mic size={18} className="text-black" />
                </div>
                <div>
                  <div className="text-white font-medium">
                    BegaByte Assistant
                  </div>
                  <div className="text-white/60 text-sm">
                    {phase === "listening" ? "Listening…" : "Ready"}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  try {
                    window.speechSynthesis?.cancel();
                  } catch {}
                  onClose?.();
                }}
                className="text-white/70 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* listening bars */}
            <div className="h-16 grid place-items-center mb-4">
              <div className="flex items-end gap-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={`bbbar-${i}`}
                    className={`w-2 rounded-full bg-[var(--brand)] ${
                      phase === "listening" ? "bbbar" : "bbbar-idle"
                    }`}
                    style={{ ["--bb-delay"]: `${i * 0.12}s` }}
                  />
                ))}
              </div>
            </div>

            {/* transcript */}
            <div className="max-h-48 overflow-auto space-y-2 mb-3 pr-1">
              {log.map((m, idx) => (
                <div
                  key={`row-${idx}`}
                  className={`text-sm ${
                    m.role === "user" ? "text-white" : "text-white/80"
                  }`}
                >
                  <span className="opacity-60 mr-1">
                    {m.role === "user" ? "You:" : "BegaByte:"}
                  </span>
                  {m.text}
                </div>
              ))}
            </div>

            {/* input row */}
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder='Try: "Set volume to 30" or "Climate 22"'
                className="flex-1 bg-white/5 border border-white/12 rounded-2xl px-4 py-3 text-white placeholder:text-white/40"
              />
              <button
                onClick={handleSend}
                disabled={sending || input.trim().length === 0}
                className={`px-4 py-3 rounded-2xl border flex items-center gap-2 ${
                  sending || input.trim().length === 0
                    ? "opacity-50 cursor-not-allowed border-white/10 text-white/40"
                    : "border-[var(--brand)] text-white hover:bg-[var(--brand)]/15"
                }`}
                title="Send"
              >
                <Play size={18} />
                <span className="text-sm">Send</span>
              </button>
            </div>
          </motion.div>

          {/* styles to avoid animation+delay warnings */}
          <style>{`
            .bbbar {
              height: 10px;
              opacity: .9;
              animation-name: bbBarBounce;
              animation-duration: 1.1s;
              animation-timing-function: ease-in-out;
              animation-iteration-count: infinite;
              animation-delay: var(--bb-delay, 0s);
            }
            .bbbar-idle {
              height: 10px;
              opacity: .5;
            }
            @keyframes bbBarBounce {
              0%,100% { height: 10px; opacity: .75; }
              50%     { height: 24px; opacity: 1;    }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
