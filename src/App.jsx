import React, { useEffect, useMemo, useRef, useState } from "react";
import { Thermometer, Volume2, Lightbulb, Flame, Mic } from "lucide-react";
import { motion } from "framer-motion";
import { normalizeVehicle, defaultVehicle } from "./state/defaults";
import SliderRow from "./components/SliderRow.jsx";
import Sheet from "./components/Sheet.jsx";
import VoiceModal from "./components/VoiceModal.jsx";

// Dava Brand Colors
const COLORS = {
  primary: "#192B37",
  accent: "#3DD17B", 
  secondary: "#F99C11",
  gray: "#47555F",
  lightBg: "#E8EAEB",
  neutralBg: "#D1D5D7",
  textSecondary: "#A3AAAF",
  cardAccents: {
    climate: "#3DD17B",
    music: "#F99C11", 
    lighting: "#5899C4",
    seats: "#FF5641"
  }
};

/* ---------------------------------------
   Local storage helper
--------------------------------------- */
function useLocal(key, initial) {
  const [val, setVal] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch {}
  }, [key, val]);
  return [val, setVal];
}

/* ---------------------------------------
   Small tween helper (requestAnimationFrame)
--------------------------------------- */
function tweenNumber({ from, to, ms = 500, step, done }) {
  const start = performance.now();
  const d = Math.max(1, ms);
  const delta = to - from;
  let raf;
  const tick = (t) => {
    const k = Math.min(1, (t - start) / d);
    const eased = 1 - Math.pow(1 - k, 3); // easeOutCubic
    const v = from + delta * eased;
    step?.(v);
    if (k < 1) raf = requestAnimationFrame(tick);
    else done?.();
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}

/* ---------------------------------------
   App
--------------------------------------- */
export default function App() {
  // vehicle state
  const [vehicle, setVehicle] = useLocal("dava.vehicle", defaultVehicle);
  const v = useMemo(() => normalizeVehicle(vehicle), [vehicle]);

  // clock
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");

  // sheets & assistant
  const [sheet, setSheet] = useState({ open: false, kind: null, title: "" });
  const [aiOpen, setAiOpen] = useState(false);
  const closeSheet = () => setSheet({ open: false, kind: null, title: "" });
  const openSheet = (kind, title) => setSheet({ open: true, kind, title });

  // cancel any in-flight tween
  const cancelTweenRef = useRef(null);
  const startTween = (args) => {
    cancelTweenRef.current?.();
    cancelTweenRef.current = tweenNumber(args);
  };

  /* ---------------------------------------
     Intent → open sheet + animate
  --------------------------------------- */
  const coreDispatch = (action, rawValue) => {
    const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
    const toInt = (n) => (Number.isFinite(+n) ? Math.round(+n) : 0);

    switch (action) {
      /* ----- CLIMATE ----- */
      case "climate_turn_on": {
        openSheet("climate", "Climate Control");
        setVehicle((s) => ({
          ...s,
          climate: { ...normalizeVehicle(s).climate, on: true },
        }));
        break;
      }
      case "climate_turn_off": {
        openSheet("climate", "Climate Control");
        setVehicle((s) => ({
          ...s,
          climate: { ...normalizeVehicle(s).climate, on: false },
        }));
        break;
      }
      case "climate_set_temperature": {
        const to = clamp(toInt(rawValue), 16, 30);
        openSheet("climate", "Climate Control");
        const from = v.climate.temp;
        startTween({
          from,
          to,
          ms: 500,
          step: (val) =>
            setVehicle((s) => ({
              ...s,
              climate: {
                ...normalizeVehicle(s).climate,
                on: true,
                temp: Math.round(val),
              },
            })),
        });
        break;
      }
      case "climate_increase": {
        openSheet("climate", "Climate Control");
        const to = clamp(v.climate.temp + 1, 16, 30);
        startTween({
          from: v.climate.temp,
          to,
          ms: 500,
          step: (val) =>
            setVehicle((s) => ({
              ...s,
              climate: {
                ...normalizeVehicle(s).climate,
                on: true,
                temp: Math.round(val),
              },
            })),
        });
        break;
      }
      case "climate_decrease": {
        openSheet("climate", "Climate Control");
        const to = clamp(v.climate.temp - 1, 16, 30);
        startTween({
          from: v.climate.temp,
          to,
          ms: 500,
          step: (val) =>
            setVehicle((s) => ({
              ...s,
              climate: {
                ...normalizeVehicle(s).climate,
                on: true,
                temp: Math.round(val),
              },
            })),
        });
        break;
      }

      /* ----- MUSIC / INFOTAINMENT (volume only) ----- */
      case "infotainment_set_volume": {
        const to = clamp(toInt(rawValue), 0, 100);
        openSheet("music", "Entertainment System");
        startTween({
          from: v.media.volume,
          to,
          ms: 500,
          step: (val) =>
            setVehicle((s) => ({
              ...s,
              media: {
                ...normalizeVehicle(s).media,
                on: true,
                volume: Math.round(val),
              },
            })),
        });
        break;
      }
      case "infotainment_volume_up": {
        const to = clamp(v.media.volume + 5, 0, 100);
        openSheet("music", "Entertainment System");
        startTween({
          from: v.media.volume,
          to,
          ms: 500,
          step: (val) =>
            setVehicle((s) => ({
              ...s,
              media: {
                ...normalizeVehicle(s).media,
                on: true,
                volume: Math.round(val),
              },
            })),
        });
        break;
      }
      case "infotainment_volume_down": {
        const to = clamp(v.media.volume - 5, 0, 100);
        openSheet("music", "Entertainment System");
        startTween({
          from: v.media.volume,
          to,
          ms: 500,
          step: (val) =>
            setVehicle((s) => ({
              ...s,
              media: {
                ...normalizeVehicle(s).media,
                on: true,
                volume: Math.round(val),
              },
            })),
        });
        break;
      }

      /* ----- LIGHTS ----- */
      case "lights_turn_on": {
        openSheet("lighting", "Interior Lighting");
        const to = Math.max(20, v.lights.brightness || 20);
        startTween({
          from: v.lights.brightness,
          to,
          ms: 500,
          step: (val) =>
            setVehicle((s) => ({
              ...s,
              lights: {
                ...normalizeVehicle(s).lights,
                on: true,
                brightness: Math.round(val),
              },
            })),
        });
        break;
      }
      case "lights_turn_off": {
        openSheet("lighting", "Interior Lighting");
        startTween({
          from: v.lights.brightness,
          to: 0,
          ms: 500,
          step: (val) =>
            setVehicle((s) => ({
              ...s,
              lights: {
                ...normalizeVehicle(s).lights,
                on: false,
                brightness: Math.round(val),
              },
            })),
        });
        break;
      }
      case "lights_dim": {
        openSheet("lighting", "Interior Lighting");
        const to = Math.max(0, v.lights.brightness - 10);
        startTween({
          from: v.lights.brightness,
          to,
          ms: 500,
          step: (val) =>
            setVehicle((s) => ({
              ...s,
              lights: {
                ...normalizeVehicle(s).lights,
                on: true,
                brightness: Math.round(val),
              },
            })),
        });
        break;
      }
      case "lights_brighten": {
        openSheet("lighting", "Interior Lighting");
        const to = Math.min(100, v.lights.brightness + 10);
        startTween({
          from: v.lights.brightness,
          to,
          ms: 500,
          step: (val) =>
            setVehicle((s) => ({
              ...s,
              lights: {
                ...normalizeVehicle(s).lights,
                on: true,
                brightness: Math.round(val),
              },
            })),
        });
        break;
      }

      /* ----- SEATS (global) ----- */
      case "seats_heat_on":
        openSheet("seats", "Seat Controls");
        setVehicle((s) => ({
          ...s,
          seats: { ...normalizeVehicle(s).seats, heatOn: true },
        }));
        break;
      case "seats_heat_off":
        openSheet("seats", "Seat Controls");
        setVehicle((s) => ({
          ...s,
          seats: { ...normalizeVehicle(s).seats, heatOn: false },
        }));
        break;
      case "seats_adjust": {
        const to = Math.min(5, Math.max(1, Math.round(+rawValue || 0)));
        openSheet("seats", "Seat Controls");
        startTween({
          from: v.seats.position,
          to,
          ms: 500,
          step: (val) =>
            setVehicle((s) => ({
              ...s,
              seats: {
                ...normalizeVehicle(s).seats,
                position: Math.round(val),
              },
            })),
        });
        break;
      }

      default:
        break;
    }
  };

  // wrapper so animation runs AFTER the AI closes
  const dispatchAfterAiClose = (action, value) => {
    setAiOpen(false); // 1) close immediately
    setTimeout(() => {
      // 2) wait for modal to fade out
      coreDispatch(action, value); // 3) then open the sheet + animate
    }, 300);
  };

  /* ---------------------------------------
     Modern Card Component
  --------------------------------------- */
  const ModernCard = ({ title, icon: Icon, active, children, onClick, accentColor, description, value, unit }) => (
    <motion.button
      onClick={onClick}
      className="group relative text-left w-full h-64 rounded-3xl border border-gray-200 bg-white/80 backdrop-blur-sm p-8 shadow-lg hover:shadow-2xl transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-offset-2 overflow-hidden"
      style={{ '--focus-color': accentColor }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Background gradient overlay */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500"
        style={{ 
          background: `linear-gradient(135deg, ${accentColor}20 0%, ${accentColor}10 100%)`
        }}
      />
      
      {/* Header */}
      <div className="flex items-start justify-between mb-6 relative z-10">
        <div 
          className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm transition-all duration-500 group-hover:scale-110"
          style={{ 
            backgroundColor: active ? accentColor : `${accentColor}15`,
            color: active ? "white" : accentColor
          }}
        >
          <Icon size={28} />
        </div>
        
        <div 
          className="text-xs px-3 py-1.5 rounded-full font-semibold tracking-wide transition-all duration-500"
          style={{ 
            backgroundColor: active ? `${accentColor}20` : COLORS.lightBg,
            color: active ? accentColor : COLORS.gray
          }}
        >
          {active ? "ACTIVE" : "STANDBY"}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <h3 
          className="text-2xl font-bold mb-2 transition-colors duration-500 group-hover:scale-105 origin-left"
          style={{ color: active ? accentColor : COLORS.primary }}
        >
          {title}
        </h3>
        
        <p className="text-sm mb-4" style={{ color: COLORS.textSecondary }}>
          {description}
        </p>
        
        {/* Value display */}
        <div className="flex items-end gap-2">
          <span 
            className="text-3xl font-bold transition-all duration-500"
            style={{ color: active ? accentColor : COLORS.primary }}
          >
            {value}
          </span>
          <span 
            className="text-lg font-medium mb-1"
            style={{ color: COLORS.textSecondary }}
          >
            {unit}
          </span>
        </div>
        
        <div className="text-sm mt-2" style={{ color: COLORS.gray }}>
          {children}
        </div>
      </div>

      {/* Subtle animation line */}
      <div 
        className="absolute bottom-0 left-0 h-1 transition-all duration-500"
        style={{ 
          width: active ? "100%" : "0%",
          backgroundColor: accentColor
        }}
      />
    </motion.button>
  );

  /* ---------------------------------------
     Render
  --------------------------------------- */
  return (
    <div className="min-h-screen relative" style={{ backgroundColor: COLORS.lightBg }}>
      <div className="max-w-6xl mx-auto p-6 pb-32">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div 
            className="text-6xl font-black mb-3 tracking-tight"
            style={{ color: COLORS.primary }}
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {hh}:{mm}
          </motion.div>
          <motion.div 
            className="text-xl font-medium"
            style={{ color: COLORS.gray }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Your Vehicle AI Assistant
          </motion.div>
        </div>

        {/* Modern Dashboard Cards - 2x2 Grid */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <ModernCard
            title="Climate"
            icon={Thermometer}
            active={v.climate.on}
            accentColor={COLORS.cardAccents.climate}
            description="Cabin temperature control"
            value={v.climate.temp}
            unit="°C"
            onClick={() => openSheet("climate", "Climate Control")}
          >
       
          </ModernCard>

          <ModernCard
            title="Entertainment"
            icon={Volume2}
            active={v.media.on}
            accentColor={COLORS.cardAccents.music}
            description="Audio and media system"
            value={v.media.volume}
            unit="%"
            onClick={() => openSheet("music", "Entertainment System")}
          >
     
          </ModernCard>

          <ModernCard
            title="Lighting"
            icon={Lightbulb}
            active={v.lights.on}
            accentColor={COLORS.cardAccents.lighting}
            description="Interior lighting control"
            value={v.lights.brightness}
            unit="%"
            onClick={() => openSheet("lighting", "Interior Lighting")}
          >
        
          </ModernCard>

          <ModernCard
            title="Seats"
            icon={Flame}
            active={v.seats.heatOn}
            accentColor={COLORS.cardAccents.seats}
            description="Seat position and heating"
            value={v.seats.position}
            unit=""
            onClick={() => openSheet("seats", "Seat Controls")}
          >
        
          </ModernCard>
        </motion.div>
      </div>

      {/* Siri-style Voice Assistant Button - Fixed at bottom */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
        <motion.button
          onClick={() => setAiOpen(true)}
          className="relative w-20 h-20 rounded-full shadow-2xl text-white flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: COLORS.accent }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8, type: "spring", stiffness: 200 }}
        >
          {/* Pulsing ring effect */}
          <motion.div
            className="absolute inset-0 rounded-full border-2"
            style={{ borderColor: COLORS.accent }}
            animate={{ 
              scale: [1, 1.4, 1],
              opacity: [0.8, 0, 0.8]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
          
          {/* Gradient overlay */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: `linear-gradient(135deg, ${COLORS.accent} 0%, #2BC467 100%)`
            }}
          />
          
          <Mic size={32} className="relative z-10" />
        </motion.button>
      </div>

      {/* SHEET overlay */}
      <Sheet open={sheet.open} title={sheet.title} onClose={closeSheet}>
        {sheet.kind === "climate" && (
          <div key="climate">
            <div className="mb-6">
              <button
                onClick={() =>
                  setVehicle((s) => {
                    const c = normalizeVehicle(s).climate;
                    return { ...s, climate: { ...c, on: !c.on } };
                  })
                }
                className="px-6 py-3 rounded-xl font-medium text-white transition-all duration-200 hover:scale-105"
                style={{ backgroundColor: v.climate.on ? COLORS.gray : COLORS.cardAccents.climate }}
              >
                {v.climate.on ? "Turn Off" : "Turn On"}
              </button>
            </div>
            <SliderRow
              label="Temperature"
              value={v.climate.temp}
              min={16}
              max={30}
              unit="°C"
              accentColor={COLORS.cardAccents.climate}
              disabledVisual={!v.climate.on}
              onChange={(n) =>
                setVehicle((s) => ({
                  ...s,
                  climate: {
                    ...normalizeVehicle(s).climate,
                    on: true,
                    temp: Math.round(n),
                  },
                }))
              }
            />
          </div>
        )}

        {sheet.kind === "music" && (
          <div key="music">
            <div className="mb-6">
              <button
                onClick={() =>
                  setVehicle((s) => {
                    const m = normalizeVehicle(s).media;
                    return { ...s, media: { ...m, on: !m.on } };
                  })
                }
                className="px-6 py-3 rounded-xl font-medium text-white transition-all duration-200 hover:scale-105"
                style={{ backgroundColor: v.media.on ? COLORS.gray : COLORS.cardAccents.music }}
              >
                {v.media.on ? "Turn Off" : "Turn On"}
              </button>
            </div>
            <SliderRow
              label="Volume"
              value={v.media.volume}
              min={0}
              max={100}
              unit="%"
              accentColor={COLORS.cardAccents.music}
              disabledVisual={!v.media.on}
              onChange={(n) =>
                setVehicle((s) => ({
                  ...s,
                  media: {
                    ...normalizeVehicle(s).media,
                    on: true,
                    volume: Math.round(n),
                  },
                }))
              }
            />
          </div>
        )}

        {sheet.kind === "lighting" && (
          <div key="lighting">
            <div className="mb-6">
              <button
                onClick={() =>
                  setVehicle((s) => {
                    const l = normalizeVehicle(s).lights;
                    const on = !l.on;
                    return {
                      ...s,
                      lights: {
                        ...l,
                        on,
                        brightness: on ? Math.max(20, l.brightness) : 0,
                      },
                    };
                  })
                }
                className="px-6 py-3 rounded-xl font-medium text-white transition-all duration-200 hover:scale-105"
                style={{ backgroundColor: v.lights.on ? COLORS.gray : COLORS.cardAccents.lighting }}
              >
                {v.lights.on ? "Turn Off" : "Turn On"}
              </button>
            </div>
            <SliderRow
              label="Brightness"
              value={v.lights.brightness}
              min={0}
              max={100}
              unit="%"
              accentColor={COLORS.cardAccents.lighting}
              disabledVisual={!v.lights.on}
              onChange={(n) =>
                setVehicle((s) => ({
                  ...s,
                  lights: {
                    ...normalizeVehicle(s).lights,
                    on: true,
                    brightness: Math.round(n),
                  },
                }))
              }
            />
          </div>
        )}

        {sheet.kind === "seats" && (
          <div key="seats">
            <div className="mb-6">
              <button
                onClick={() =>
                  setVehicle((s) => ({
                    ...s,
                    seats: {
                      ...normalizeVehicle(s).seats,
                      heatOn: !normalizeVehicle(s).seats.heatOn,
                    },
                  }))
                }
                className="px-6 py-3 rounded-xl font-medium text-white transition-all duration-200 hover:scale-105"
                style={{ backgroundColor: v.seats.heatOn ? COLORS.gray : COLORS.cardAccents.seats }}
              >
                {v.seats.heatOn ? "Heat Off" : "Heat On"}
              </button>
            </div>
            <SliderRow
              label="Position"
              value={v.seats.position}
              min={1}
              max={5}
              accentColor={COLORS.cardAccents.seats}
              onChange={(n) =>
                setVehicle((s) => ({
                  ...s,
                  seats: {
                    ...normalizeVehicle(s).seats,
                    position: Math.round(n),
                  },
                }))
              }
            />
          </div>
        )}
      </Sheet>

      {/* Siri-style Voice Modal */}
      <VoiceModal
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        dispatchAction={dispatchAfterAiClose}
      />
    </div>
  );
}