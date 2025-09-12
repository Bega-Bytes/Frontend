import React, { useEffect, useMemo, useRef, useState } from "react";
import { Thermometer, Volume2, Lightbulb, Flame, Mic } from "lucide-react";
import { motion } from "framer-motion";
import { normalizeVehicle, defaultVehicle } from "./state/defaults";
import SliderRow from "./components/SliderRow.jsx";
import Sheet from "./components/Sheet.jsx";
import VoiceModal from "./components/VoiceModal.jsx";

// Brand colors
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
    music: "#a904a9ff",
    lighting: "#5899C4",
    seats: "#FF5641",
  },
};

/* ---------- localStorage hook ---------- */
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

/* ---------- rAF tween helper ---------- */
function tweenNumber({ from, to, ms = 500, step, done }) {
  const start = performance.now();
  const d = Math.max(1, ms);
  const delta = to - from;
  let raf;

  const tick = (t) => {
    const k = Math.min(1, (t - start) / d);
    const eased = 1 - Math.pow(1 - k, 3);
    const v = from + delta * eased;
    step?.(v);
    if (k < 1) raf = requestAnimationFrame(tick);
    else done?.();
  };

  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}

/* ---------- Clock ---------- */
const Clock = React.memo(function Clock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");

  return (
    <motion.div
      initial={false}
      className="text-6xl font-black mb-3 tracking-tight"
      style={{ color: COLORS.primary }}
    >
      {hh}:{mm}
    </motion.div>
  );
});

/* ---------- ModernCard ---------- */
const ModernCard = React.memo(function ModernCard({
  title,
  icon: Icon,
  active,
  onClick,
  accentColor,
  description,
  value,
  unit,
}) {
  const headerBadgeStyle = useMemo(
    () => ({
      backgroundColor: active ? `${accentColor}20` : COLORS.lightBg,
      color: active ? accentColor : COLORS.gray,
    }),
    [active, accentColor]
  );

  const iconStyle = useMemo(
    () => ({
      backgroundColor: active ? accentColor : `${accentColor}15`,
      color: active ? "white" : accentColor,
    }),
    [active, accentColor]
  );

  const hoverOverlayStyle = useMemo(
    () => ({
      background: `linear-gradient(135deg, ${accentColor}20 0%, ${accentColor}10 100%)`,
    }),
    [accentColor]
  );

  return (
    <motion.button
      initial={false}
      onClick={onClick}
      className="group relative text-left w-full h-64 rounded-3xl border border-gray-200 bg-white/80 backdrop-blur-sm p-8 shadow-lg hover:shadow-2xl transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-offset-2 overflow-hidden"
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500"
        style={hoverOverlayStyle}
      />

      <div className="flex items-start justify-between mb-6 relative z-10">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm transition-all duration-500 group-hover:scale-110"
          style={iconStyle}
        >
          <Icon size={28} />
        </div>

        <div
          className="text-xs px-3 py-1.5 rounded-full font-semibold tracking-wide transition-all duration-500"
          style={headerBadgeStyle}
        >
          {active ? "ACTIVE" : "STANDBY"}
        </div>
      </div>

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
      </div>

      <div
        className="absolute bottom-0 left-0 h-1 transition-all duration-500"
        style={{
          width: active ? "100%" : "0%",
          backgroundColor: accentColor,
        }}
      />
    </motion.button>
  );
});

/* ---------- AI Recommendation Notification ---------- */
const AIRecommendationPrompt = React.memo(function AIRecommendationPrompt({
  open,
  onClose,
  onAccept,
  recommendations = [],
}) {
  if (!open || !recommendations.length) return null;

  const recommendation = recommendations[0]; // Show first recommendation

  return (
    <div className="fixed inset-0 z-[70] flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "rgba(0,0,0,0.38)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
        onClick={onClose}
      />

      {/* Bottom sheet card */}
      <div className="relative flex flex-col justify-end h-full w-full">
        <div
          className="w-full max-w-3xl mx-auto h-[50%] rounded-t-3xl overflow-hidden border shadow-2xl"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(245,247,248,0.85) 100%)",
            borderColor: "rgba(25,43,55,0.12)",
            boxShadow: "0 24px 60px rgba(25,43,55,0.28), inset 0 1px 0 rgba(255,255,255,0.6)",
          }}
        >
          {/* Header */}
          <div
            className="relative p-6 border-b flex items-center justify-center"
            style={{
              borderColor: "rgba(25,43,55,0.1)",
              background: "linear-gradient(135deg, rgba(61,209,123,0.12) 0%, rgba(88,153,196,0.12) 100%)",
            }}
          >
            <div
              className="text-lg font-extrabold tracking-tight"
              style={{ color: COLORS.primary }}
            >
              AI Recommendation
            </div>
            <button
              onClick={onClose}
              className="absolute right-6 top-6 w-9 h-9 rounded-full bg-black/5 hover:bg-black/10 transition grid place-items-center"
              aria-label="Close"
            >
              <span className="text-black/60 text-lg leading-none">×</span>
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-6 flex justify-center">
            <div className="w-full max-w-[560px]">
              <div
                className="rounded-2xl p-6 border shadow-sm"
                style={{
                  background: "white",
                  borderColor: "rgba(25,43,55,0.08)",
                }}
              >
                <div
                  className="text-[17px] font-semibold mb-4"
                  style={{ color: COLORS.primary }}
                >
                  {recommendation.message}
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl font-semibold border hover:shadow-sm transition"
                    style={{
                      borderColor: "rgba(25,43,55,0.15)",
                      color: COLORS.primary,
                      background: "#fff",
                    }}
                  >
                    No
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onAccept?.(recommendation);
                    }}
                    className="px-5 py-2.5 rounded-xl font-semibold text-white shadow hover:shadow-md transition"
                    style={{ background: COLORS.accent }}
                  >
                    Yes
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* footer fade */}
          <div
            className="h-6 pointer-events-none"
            style={{
              background: "linear-gradient(to top, rgba(255,255,255,0.9), rgba(255,255,255,0))",
            }}
          />
        </div>
      </div>
    </div>
  );
});

/* ---------- App ---------- */
export default function App() {
  // Vehicle state
  const [vehicle, setVehicle] = useLocal("dava.vehicle", defaultVehicle);
  const v = useMemo(() => normalizeVehicle(vehicle), [vehicle]);

  // Sheets & AI
  const [sheet, setSheet] = useState({ open: false, kind: null, title: "" });
  const [aiOpen, setAiOpen] = useState(false);
  const closeSheet = () => setSheet({ open: false, kind: null, title: "" });
  const openSheet = (kind, title) => setSheet({ open: true, kind, title });
// Kill-switch: disable automatic popups triggered by commands/back-end
const AUTO_SHEET_POPUP = false;

// Use this for programmatic opens (command handlers, backend updates)
const autoOpenSheet = (kind, title) => {
  if (!AUTO_SHEET_POPUP) return;
  openSheet(kind, title);
};


  // AI Recommendations
  const [aiRecommendation, setAiRecommendation] = useState({
    open: false,
    recommendations: [],
  });

  // MQTT Connection
  const mqttClient = useRef(null);
  const mqttWs = useRef(null);

  // Per-field tweeners
  const tweeners = useRef({});
  const startTweenKey = (key, args) => {
    if (tweeners.current[key]) tweeners.current[key]();
    tweeners.current[key] = tweenNumber(args);
  };

  // delayed tween starter (to begin 1s later)
  const startTweenKeyDelayed = (key, args, delayMs = 1000) => {
    if (tweeners.current[key]) tweeners.current[key]();
    const launch = () => {
      tweeners.current[key] = tweenNumber(args);
    };
    if (delayMs > 0) setTimeout(launch, delayMs);
    else launch();
  };

  // MQTT over WebSocket Connection
  useEffect(() => {
    const connectMQTTWebSocket = () => {
      try {
        // Connect to MQTT broker via WebSocket (you'll need a WebSocket-enabled MQTT broker)
        // For testing, we'll simulate MQTT messages
        
        // Simulate MQTT connection for AI recommendations
        const simulateAIRecommendations = () => {
          const interval = setInterval(() => {
            // Simulate receiving AI recommendations randomly
            if (Math.random() > 0.995) { // 0.5% chance every second for demo
              const mockRecommendations = [
                {
                  action: 'climate_set_temperature',
                  message: 'Hello! Based on your preferences, would you like me to set the temperature to 24°C?',
                  value: 24
                },
                {
                  action: 'infotainment_play',
                  message: 'Hi! I noticed you usually prefer this, so would you like to listen to some music?',
                  value: null
                },
                {
                  action: 'lights_turn_on',
                  message: "It's getting dark, would you like me to turn on the ambient lights for a cozy atmosphere?",
                  value: null
                },
                {
                  action: 'seats_heat_on',
                  message: 'Hello! From your driving patterns, would you like me to warm up your seat?',
                  value: null
                },
                {
                  action: 'infotainment_set_volume',
                  message: 'Hi again! Your typical routine suggests should I adjust the volume to your usual 75%?',
                  value: 75
                }
              ];
              
              const randomRec = mockRecommendations[Math.floor(Math.random() * mockRecommendations.length)];
              setAiRecommendation({
                open: true,
                recommendations: [randomRec]
              });
            }
          }, 1000);

          return () => clearInterval(interval);
        };

        // For real MQTT implementation, replace the simulation with:
        /*
        const ws = new WebSocket('ws://localhost:9001'); // MQTT WebSocket port
        mqttWs.current = ws;
        
        ws.onopen = () => {
          console.log('MQTT WebSocket connected');
          // Subscribe to vehicle/recommendations topic
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'ai_suggestion' && data.recommendations) {
              setAiRecommendation({
                open: true,
                recommendations: data.recommendations
              });
            }
          } catch (error) {
            console.error('Error parsing MQTT message:', error);
          }
        };
        
        ws.onclose = () => {
          console.log('MQTT WebSocket disconnected, attempting reconnect...');
          setTimeout(connectMQTTWebSocket, 3000);
        };
        
        return () => {
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.close();
          }
        };
        */

        const cleanup = simulateAIRecommendations();
        return cleanup;
      } catch (error) {
        console.error('MQTT connection error:', error);
        setTimeout(connectMQTTWebSocket, 3000);
      }
    };

    const cleanup = connectMQTTWebSocket();
    return cleanup;
  }, []);

  // WebSocket connection (keeping existing functionality)
  useEffect(() => {
    const connectWebSocket = () => {
      const ws = new WebSocket('ws://localhost:8000/ws');

      ws.onopen = () => {
        console.log('WebSocket connected to backend');
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('WebSocket message received:', message);

          if (message.type === 'state_update' && message.data) {
            const backendState = message.data;

            if (backendState.climate && backendState.climate.temperature !== v.climate.temp) {
              const newTemp = backendState.climate.temperature;
              autoOpenSheet("climate", "Climate Control");
              startTweenKeyDelayed("temp", {
                from: v.climate.temp,
                to: newTemp,
                ms: 500,
                step: (val) =>
                  setVehicle((s) => ({
                    ...s,
                    climate: {
                      ...normalizeVehicle(s).climate,
                      on: backendState.climate.ac_enabled || false,
                      temp: Math.round(val),
                    },
                  })),
              });
            }

            if (backendState.infotainment && backendState.infotainment.volume !== v.media.volume) {
              const newVol = backendState.infotainment.volume;
              autoOpenSheet("music", "Entertainment System");
              startTweenKeyDelayed("volume", {
                from: v.media.volume,
                to: newVol,
                ms: 500,
                step: (val) =>
                  setVehicle((s) => ({
                    ...s,
                    media: {
                      ...normalizeVehicle(s).media,
                      on: backendState.infotainment.playing || false,
                      volume: Math.round(val),
                    },
                  })),
              });
            }

            if (backendState.lights && backendState.lights.brightness !== v.lights.brightness) {
              const newBrightness = backendState.lights.brightness;
              autoOpenSheet("lighting", "Interior Lighting");
              startTweenKeyDelayed("lights", {
                from: v.lights.brightness,
                to: newBrightness,
                ms: 500,
                step: (val) =>
                  setVehicle((s) => ({
                    ...s,
                    lights: {
                      ...normalizeVehicle(s).lights,
                      on: backendState.lights.interior_lights || false,
                      brightness: Math.round(val),
                    },
                  })),
              });
            }

            if (backendState.seats) {
              setVehicle(s => ({
                ...s,
                seats: {
                  ...normalizeVehicle(s).seats,
                  heatOn: backendState.seats.driver_heating || false
                }
              }));
              if (backendState.seats.driver_heating !== v.seats.heatOn) {
                autoOpenSheet("seats", "Seat Controls");
              }
            }
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected, attempting reconnect...');
        setTimeout(connectWebSocket, 3000);
      };

      return ws;
    };

    const ws = connectWebSocket();
    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  // Function to send action to MQTT
  const sendActionToMQTT = (action, value) => {
    const actionData = {
      action: action,
      value: value,
      timestamp: new Date().toISOString()
    };

    // For real MQTT implementation:
    /*
    if (mqttWs.current && mqttWs.current.readyState === WebSocket.OPEN) {
      const message = {
        topic: 'vehicle/actions',
        payload: JSON.stringify(actionData)
      };
      mqttWs.current.send(JSON.stringify(message));
      console.log('Action sent to MQTT:', actionData);
    }
    */

    console.log('Action would be sent to MQTT:', actionData);
  };

  /* ---------- Actions (AI closes, then animate with 1s delay) ---------- */
  const coreDispatch = (action, rawValue) => {
    const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
    const toInt = (n) => (Number.isFinite(+n) ? Math.round(+n) : 0);

    // Send action to MQTT
    sendActionToMQTT(action, rawValue);

    switch (action) {
      case "climate_turn_on":
        autoOpenSheet("climate", "Climate Control");
        setVehicle((s) => ({
          ...s,
          climate: { ...normalizeVehicle(s).climate, on: true },
        }));
        break;

      case "climate_turn_off":
        autoOpenSheet("climate", "Climate Control");
        setVehicle((s) => ({
          ...s,
          climate: { ...normalizeVehicle(s).climate, on: false },
        }));
        break;

      case "climate_set_temperature": {
        const to = clamp(toInt(rawValue), 16, 30);
        autoOpenSheet("climate", "Climate Control");
        startTweenKeyDelayed("temp", {
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

      case "climate_increase": {
        const to = clamp(v.climate.temp + 1, 16, 30);
        autoOpenSheet("climate", "Climate Control");
        startTweenKeyDelayed("temp", {
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
        const to = clamp(v.climate.temp - 1, 16, 30);
        autoOpenSheet("climate", "Climate Control");
        startTweenKeyDelayed("temp", {
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

      case "infotainment_play":
        autoOpenSheet("music", "Entertainment System");
        setVehicle((s) => ({
          ...s,
          media: { ...normalizeVehicle(s).media, on: true },
        }));
        break;

      case "infotainment_stop":
        autoOpenSheet("music", "Entertainment System");
        setVehicle((s) => ({
          ...s,
          media: { ...normalizeVehicle(s).media, on: false },
        }));
        break;

      case "infotainment_set_volume": {
        const to = clamp(toInt(rawValue), 0, 100);
        autoOpenSheet("music", "Entertainment System");
        startTweenKeyDelayed("volume", {
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
        const to = Math.min(100, v.media.volume + 5);
        autoOpenSheet("music", "Entertainment System");
        startTweenKeyDelayed("volume", {
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
        const to = Math.max(0, v.media.volume - 5);
        autoOpenSheet("music", "Entertainment System");
        startTweenKeyDelayed("volume", {
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

      case "lights_turn_on": {
        const to = Math.max(20, v.lights.brightness || 20);
        autoOpenSheet("lighting", "Interior Lighting");
        startTweenKeyDelayed("lights", {
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
        autoOpenSheet("lighting", "Interior Lighting");
        startTweenKeyDelayed("lights", {
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
        const to = Math.max(0, v.lights.brightness - 10);
        autoOpenSheet("lighting", "Interior Lighting");
        startTweenKeyDelayed("lights", {
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
        const to = Math.min(100, v.lights.brightness + 10);
        autoOpenSheet("lighting", "Interior Lighting");
        startTweenKeyDelayed("lights", {
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

      case "seats_heat_on":
        autoOpenSheet("seats", "Seat Controls");
        setVehicle((s) => ({
          ...s,
          seats: { ...normalizeVehicle(s).seats, heatOn: true },
        }));
        break;

      case "seats_heat_off":
        autoOpenSheet("seats", "Seat Controls");
        setVehicle((s) => ({
          ...s,
          seats: { ...normalizeVehicle(s).seats, heatOn: false },
        }));
        break;

      case "seats_adjust": {
        const to = Math.min(5, Math.max(1, Math.round(+rawValue || 0)));
        autoOpenSheet("seats", "Seat Controls");
        startTweenKeyDelayed("seatpos", {
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

  const dispatchAfterAiClose = (action, value) => {
    setAiOpen(false);
    setTimeout(() => coreDispatch(action, value), 300);
  };

  // Handle AI recommendation acceptance
  const handleAIRecommendationAccept = (recommendation) => {
    coreDispatch(recommendation.action, recommendation.value);
  };

  /* ---------- Render ---------- */
  return (
    <div className="min-h-screen relative" style={{ backgroundColor: COLORS.lightBg }}>
      <div className="max-w-6xl mx-auto p-6 pb-32">
        {/* Header */}
        <div className="text-center mb-12">
          <Clock />
          <motion.div
            initial={false}
            className="text-xl font-medium"
            style={{ color: COLORS.gray }}
          >
            Your Vehicle AI Assistant
          </motion.div>
        </div>

        {/* Cards */}
        <motion.div
          initial={false}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16"
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
          />

          <ModernCard
            title="Entertainment"
            icon={Volume2}
            active={v.media.on}
            accentColor={COLORS.cardAccents.music}
            description="Audio and media system"
            value={v.media.volume}
            unit="%"
            onClick={() => openSheet("music", "Entertainment System")}
          />

          <ModernCard
            title="Lighting"
            icon={Lightbulb}
            active={v.lights.on}
            accentColor={COLORS.cardAccents.lighting}
            description="Interior lighting control"
            value={v.lights.brightness}
            unit="%"
            onClick={() => openSheet("lighting", "Interior Lighting")}
          />

          <ModernCard
            title="Seats"
            icon={Flame}
            active={v.seats.heatOn}
            accentColor={COLORS.cardAccents.seats}
            description="Seat position and heating"
            value={v.seats.position}
            unit=""
            onClick={() => openSheet("seats", "Seat Controls")}
          />
        </motion.div>
      </div>

      {/* Centered voice button */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <motion.button
          initial={false}
          onClick={() => setAiOpen(true)}
          className="relative w-20 h-20 rounded-full shadow-2xl text-white flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: COLORS.secondary }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Assistant"
          title="Assistant"
        >
          <Mic size={32} className="relative z-10" />
        </motion.button>
      </div>

      {/* Sheet */}
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
                style={{
                  backgroundColor: v.climate.on ? COLORS.gray : COLORS.cardAccents.climate,
                }}
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
                style={{
                  backgroundColor: v.media.on ? COLORS.gray : COLORS.cardAccents.music,
                }}
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
                style={{
                  backgroundColor: v.lights.on ? COLORS.gray : COLORS.cardAccents.lighting,
                }}
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
                style={{
                  backgroundColor: v.seats.heatOn ? COLORS.gray : COLORS.cardAccents.seats,
                }}
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

      {/* Voice Modal */}
      <VoiceModal
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        dispatchAction={(action, value) => {
          // Close modal immediately
          setAiOpen(false);
          // Send to backend instead of local dispatch
          setTimeout(async () => {
            try {
              let commandText = "";
              if (action === "climate_set_temperature") {
                commandText = `set temperature to ${value}`;
              } else if (action === "climate_increase") {
                commandText = "increase temperature";
              } else if (action === "climate_decrease") {
                commandText = "decrease temperature";
              } else if (action === "infotainment_set_volume") {
                commandText = `set volume to ${value}`;
              } else if (action === "infotainment_volume_up") {
                commandText = "volume up";
              } else if (action === "infotainment_volume_down") {
                commandText = "volume down";
              } else if (action === "lights_turn_on") {
                commandText = "turn on lights";
              } else if (action === "lights_turn_off") {
                commandText = "turn off lights";
              } else if (action === "lights_brighten") {
                commandText = "brighten lights";
              } else if (action === "lights_dim") {
                commandText = "dim lights";
              } else if (action === "seats_heat_on") {
                commandText = "turn on seat heating";
              } else if (action === "seats_heat_off") {
                commandText = "turn off seat heating";
              } else {
                commandText = action.replace(/_/g, ' ') + (value && typeof value !== 'object' ? ` ${value}` : '');
              }

              await fetch('http://localhost:8000/api/nlp/process-voice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  text: commandText,
                  timestamp: Date.now()
                })
              });
              console.log('Voice command sent to backend:', commandText);
            } catch (error) {
              console.error('Backend command failed:', error);
              // Fallback to local animation if backend fails
              coreDispatch(action, value);
            }
          }, 100);
        }}
      />

      {/* AI Recommendation Prompt */}
      <AIRecommendationPrompt
        open={aiRecommendation.open}
        onClose={() => setAiRecommendation({ open: false, recommendations: [] })}
        onAccept={handleAIRecommendationAccept}
        recommendations={aiRecommendation.recommendations}
      />
    </div>
  );
}