import React from "react";

/**
 * Tall, finger-friendly slider.
 * Fill: white → orange up to knob, dark after knob (reversed).
 * `disabledVisual` only dims; still draggable (auto-powers on at handlers).
 */
export default function SliderRow({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  unit = "",
  onChange,
  disabledVisual = false,
}) {
  const pct = Math.round(((value - min) / (max - min)) * 100);

  const handle = (e) => onChange?.(Number(e.target.value));

  return (
    <div className={`mb-5 ${disabledVisual ? "opacity-45" : ""}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-white/80">{label}</div>
        <div className="px-3 py-1 rounded-md text-sm border border-white/10 bg-white/5 text-white/90">
          {value}
          {unit}
        </div>
      </div>

      <div className="h-16 grid items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onInput={handle} // updates while dragging
          onChange={handle} // Safari/edge cases
          className="w-full appearance-none bg-transparent slider-filled"
        />
      </div>

      <style>{`
        .slider-filled::-webkit-slider-runnable-track{
          height:16px; border-radius:9999px;
          background:
            linear-gradient(
              90deg,
              rgba(255,255,255,0.95) 0%,
              var(--brand) ${pct}%,
              #2a2f38 ${pct}%,
              #2a2f38 100%
            );
        }
        .slider-filled::-moz-range-track{
          height:16px; border-radius:9999px;
          background:
            linear-gradient(
              90deg,
              rgba(255,255,255,0.95) 0%,
              var(--brand) ${pct}%,
              #2a2f38 ${pct}%,
              #2a2f38 100%
            );
        }
        .slider-filled::-webkit-slider-thumb{
          -webkit-appearance:none; width:32px; height:32px;
          border-radius:9999px; background:#fff; margin-top:-8px;
          box-shadow:0 0 0 6px rgba(255,122,0,.22);
        }
        .slider-filled::-moz-range-thumb{
          width:32px; height:32px; border:none; border-radius:9999px; background:#fff;
          box-shadow:0 0 0 6px rgba(255,122,0,.22);
        }
      `}</style>
    </div>
  );
}
