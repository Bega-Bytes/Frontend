import React, { useEffect, useMemo, useRef, useState } from "react";
import { Thermometer, Volume2, Lightbulb, Flame, Mic } from "lucide-react";
import { normalizeVehicle, defaultVehicle } from "./state/defaults";
import SliderRow from "./components/SliderRow.jsx";
import Sheet from "./components/Sheet.jsx";
import VoiceModal from "./components/VoiceModal.jsx";

const ORANGE = "#ff7a00";
const BG =
  "bg-[linear-gradient(135deg,_#0b0d10_0%,_#101318_40%,_#181c23_100%)]";

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
  const [vehicle, setVehicle] = useLocal("bb.vehicle", defaultVehicle);
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
        openSheet("climate", "Climate");
        setVehicle((s) => ({
          ...s,
          climate: { ...normalizeVehicle(s).climate, on: true },
        }));
        break;
      }
      case "climate_turn_off": {
        openSheet("climate", "Climate");
        setVehicle((s) => ({
          ...s,
          climate: { ...normalizeVehicle(s).climate, on: false },
        }));
        break;
      }
      case "climate_set_temperature": {
        const to = clamp(toInt(rawValue), 16, 30);
        openSheet("climate", "Climate");
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
        openSheet("climate", "Climate");
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
        openSheet("climate", "Climate");
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
        openSheet("music", "Music");
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
        openSheet("music", "Music");
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
        openSheet("music", "Music");
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
        openSheet("lighting", "Interior Lights");
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
        openSheet("lighting", "Interior Lights");
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
        openSheet("lighting", "Interior Lights");
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
        openSheet("lighting", "Interior Lights");
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
        openSheet("seats", "Seats");
        setVehicle((s) => ({
          ...s,
          seats: { ...normalizeVehicle(s).seats, heatOn: true },
        }));
        break;
      case "seats_heat_off":
        openSheet("seats", "Seats");
        setVehicle((s) => ({
          ...s,
          seats: { ...normalizeVehicle(s).seats, heatOn: false },
        }));
        break;
      case "seats_adjust": {
        const to = Math.min(5, Math.max(1, Math.round(+rawValue || 0)));
        openSheet("seats", "Seats");
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
     Card
  --------------------------------------- */
  const Card = ({ title, icon: Icon, active, children, onOpen }) => (
    <button
      onClick={onOpen}
      className="text-left rounded-3xl border p-7 transition
      border-white/10 bg-[rgba(37,36,36,0.52)] hover:bg-white/[0.12]
      w-[640px] min-h-[170px] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
    >
      <div className="flex items-center gap-3">
        <div
          className={`grid place-items-center w-11 h-11 rounded-xl ${
            active ? "bg-[var(--brand)] text-black" : "bg-white/10 text-white"
          }`}
        >
          <Icon size={20} />
        </div>
        <div
          className={`font-semibold tracking-wide ${
            active ? "text-[var(--brand)]" : "text-white"
          }`}
        >
          {title}
        </div>
      </div>
      <div className="text-white/85 text-lg mt-4">{children}</div>
    </button>
  );

  /* ---------------------------------------
     Render
  --------------------------------------- */
  return (
    <div
      className={`${BG} min-h-screen w-full`}
      style={{ ["--brand"]: ORANGE }}
    >
      {/* main card (fullscreen with small margin) */}
      <div className="relative mx-auto my-[2.5vh] w-[95vw] h-[95vh] max-w-[1680px] rounded-[28px] border border-white/10 overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.35)]">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative h-full w-full p-8 overflow-hidden">
          {/* clock */}
          <div className="absolute left-1/2 -translate-x-1/2 top-6 text-white/90 text-4xl font-semibold">
            {hh}:{mm}
          </div>

          {/* content scroll only inside the card */}
          <div className="h-full pt-20 pb-24 overflow-auto">
            <div className="flex flex-wrap gap-10 justify-center">
              {/* Climate */}
              <Card
                title="Climate"
                icon={Thermometer}
                active={v.climate.on}
                onOpen={() => openSheet("climate", "Climate")}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={v.climate.on ? "text-white" : "text-white/60"}
                  >
                    {v.climate.on ? "On" : "Off"}
                  </span>
                  <span>•</span>
                  <span>{v.climate.temp}°C</span>
                </div>
              </Card>

              {/* Music (volume only) */}
              <Card
                title="Music"
                icon={Volume2}
                active={v.media.on}
                onOpen={() => openSheet("music", "Music")}
              >
                <div className="flex items-center gap-3">
                  <span className={v.media.on ? "text-white" : "text-white/60"}>
                    {v.media.on ? "On" : "Off"}
                  </span>
                  <span>•</span>
                  <span>Volume {v.media.volume}%</span>
                </div>
              </Card>

              {/* Lighting */}
              <Card
                title="Lighting"
                icon={Lightbulb}
                active={v.lights.on}
                onOpen={() => openSheet("lighting", "Interior Lights")}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={v.lights.on ? "text-white" : "text-white/60"}
                  >
                    {v.lights.on ? "On" : "Off"}
                  </span>
                  <span>•</span>
                  <span>Brightness {v.lights.brightness}%</span>
                </div>
              </Card>

              {/* Seats (global) */}
              <Card
                title="Seats"
                icon={Flame}
                active={v.seats.heatOn}
                onOpen={() => openSheet("seats", "Seats")}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={v.seats.heatOn ? "text-white" : "text-white/60"}
                  >
                    {v.seats.heatOn ? "Heat On" : "Heat Off"}
                  </span>
                  <span>•</span>
                  <span>Position {v.seats.position}</span>
                </div>
              </Card>
            </div>
          </div>

          {/* AI FAB (inside the card, centered on bottom) */}
          <button
            onClick={() => setAiOpen(true)}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[65] w-16 h-16 rounded-full grid place-items-center bg-[var(--brand)] text-black shadow-lg hover:scale-[1.03] transition"
            title="Assistant"
            aria-label="Assistant"
          >
            <Mic size={22} />
          </button>

          {/* SHEET overlay */}
          <Sheet open={sheet.open} title={sheet.title} onClose={closeSheet}>
            {sheet.kind === "climate" && (
              <div key="climate">
                <div className="mb-4">
                  <button
                    onClick={() =>
                      setVehicle((s) => {
                        const c = normalizeVehicle(s).climate;
                        return { ...s, climate: { ...c, on: !c.on } };
                      })
                    }
                    className="px-4 py-2 rounded-xl bg-white/10 border border-white/15 text-white/90"
                  >
                    {v.climate.on ? "Power Off" : "Power On"}
                  </button>
                </div>
                <SliderRow
                  label="Cabin Temperature"
                  value={v.climate.temp}
                  min={16}
                  max={30}
                  unit="°C"
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
                <div className="mb-4">
                  <button
                    onClick={() =>
                      setVehicle((s) => {
                        const m = normalizeVehicle(s).media;
                        return { ...s, media: { ...m, on: !m.on } };
                      })
                    }
                    className="px-4 py-2 rounded-xl bg-white/10 border border-white/15 text-white/90"
                  >
                    {v.media.on ? "Power Off" : "Power On"}
                  </button>
                </div>
                <SliderRow
                  label="Volume"
                  value={v.media.volume}
                  min={0}
                  max={100}
                  unit="%"
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
                <div className="mb-4">
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
                    className="px-4 py-2 rounded-xl bg-white/10 border border-white/15 text-white/90"
                  >
                    {v.lights.on ? "Power Off" : "Power On"}
                  </button>
                </div>
                <SliderRow
                  label="Brightness"
                  value={v.lights.brightness}
                  min={0}
                  max={100}
                  unit="%"
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
                <div className="mb-4">
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
                    className="px-4 py-2 rounded-xl bg-white/10 border border-white/15 text-white/90"
                  >
                    {v.seats.heatOn ? "Heat Off" : "Heat On"}
                  </button>
                </div>
                <SliderRow
                  label="Position"
                  value={v.seats.position}
                  min={1}
                  max={5}
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

          {/* Assistant — hands off action; we close first, then animate */}
          <VoiceModal
            open={aiOpen}
            onClose={() => setAiOpen(false)}
            dispatchAction={dispatchAfterAiClose}
          />
        </div>
      </div>
    </div>
  );
}
