import React from "react";
import { Lightbulb } from "lucide-react";

/**
 * Lighting slider with 3 discrete values:
 * 0=Off, 1=Low, 2=High
 * Displays text and sets brightness accordingly.
 */
export default function LightingSliderRow({
  mode, // 0 | 1 | 2
  onChangeMode, // (0|1|2)=>void
  disabled = false,
}) {
  const labels = ["Off", "Low", "High"];
  const pct = (mode / 2) * 100;

  return (
    <div
      className={`rounded-2xl border p-5 ${
        disabled ? "opacity-50 pointer-events-none" : ""
      }`}
      style={{
        background: "rgba(37,36,36,0.52)",
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl grid place-items-center bg-white/10">
            <Lightbulb className="text-white" size={18} />
          </div>
          <div className="text-white/80">Lighting</div>
        </div>
        <div className="text-white/90">{labels[mode]}</div>
      </div>

      <div className="relative">
        {/* reversed style */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-[12px] w-full rounded-full overflow-hidden"
          style={{ background: "#1f232a" }}
        >
          <div
            className="absolute left-0 top-0 h-full"
            style={{
              width: `${pct}%`,
              background: "linear-gradient(90deg,#fff,#fff)",
            }}
          />
          <div
            className="absolute"
            style={{
              left: `calc(${pct}% - 1px)`,
              top: 0,
              width: "2px",
              height: "100%",
              background: "var(--brand,#ff7a00)",
            }}
          />
        </div>

        <input
          type="range"
          min={0}
          max={2}
          step={1}
          value={mode}
          onChange={(e) => onChangeMode?.(Number(e.target.value))}
          className="bb-range w-full"
          aria-label="Lighting"
        />
      </div>
    </div>
  );
}
