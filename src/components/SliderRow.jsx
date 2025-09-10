import React from "react";

/**
 * Enhanced slider component with Dava branding
 * Features smooth animations, better accessibility, and professional styling
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
  accentColor = "#3DD17B", // Default Dava accent color
}) {
  const pct = Math.round(((value - min) / (max - min)) * 100);

  const handle = (e) => {
    const newValue = Number(e.target.value);
    onChange?.(newValue);
  };

  // Generate unique ID for accessibility
  const sliderId = `slider-${label
    .toLowerCase()
    .replace(/\s+/g, "-")}-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div
      className={`mb-6 transition-opacity duration-300 ${
        disabledVisual ? "opacity-50" : ""
      }`}
    >
      {/* Label and Value Display */}
      <div className="flex items-center justify-between mb-4">
        <label
          htmlFor={sliderId}
          className="text-base font-semibold"
          style={{ color: "#192B37" }}
        >
          {label}
        </label>
        <div
          className="px-4 py-2 rounded-lg text-sm font-bold shadow-sm border transition-all duration-200"
          style={{
            backgroundColor: disabledVisual ? "#D1D5D7" : "#E8EAEB",
            color: disabledVisual ? "#A3AAAF" : "#192B37",
            borderColor: "rgba(25, 43, 55, 0.1)",
          }}
        >
          {value}
          {unit}
        </div>
      </div>

      {/* Slider Container */}
      <div className="relative h-16 flex items-center group">
        {/* Track Background */}
        <div
          className="absolute inset-x-0 h-3 rounded-full shadow-inner"
          style={{
            backgroundColor: "#D1D5D7",
            top: "50%",
            transform: "translateY(-50%)",
          }}
        />

        {/* Active Track */}
        <div
          className="absolute h-3 rounded-full shadow-sm transition-all duration-300 ease-out"
          style={{
            backgroundColor: disabledVisual ? "#A3AAAF" : accentColor,
            width: `${pct}%`,
            top: "50%",
            transform: "translateY(-50%)",
            boxShadow: disabledVisual ? "none" : `0 2px 8px ${accentColor}40`,
          }}
        />

        {/* Slider Input */}
        <input
          id={sliderId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onInput={handle}
          onChange={handle}
          disabled={disabledVisual}
          className="relative w-full h-3 bg-transparent appearance-none cursor-pointer focus:outline-none disabled:cursor-not-allowed z-10"
          style={{
            background: "transparent",
          }}
          aria-label={`${label}: ${value}${unit}`}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
        />

        {/* Progress Indicator */}
        <div
          className="absolute text-xs font-medium transition-all duration-300 pointer-events-none progress-indicator"
          style={{
            left: `calc(${pct}% - 20px)`,
            top: "-32px",
            color: disabledVisual ? "#A3AAAF" : accentColor,
            opacity: disabledVisual ? 0.5 : 0,
            transform: "translateX(50%)",
          }}
        >
          {value}
          {unit}
        </div>
      </div>

      {/* Value Range Display */}
      <div
        className="flex justify-between mt-2 text-xs font-medium"
        style={{ color: "#A3AAAF" }}
      >
        <span>
          {min}
          {unit}
        </span>
        <span>
          {max}
          {unit}
        </span>
      </div>

      {/* NOTE: In Vite/React use plain <style>, not <style jsx> */}
      <style>{`
        input[type="range"] {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: white;
          border: 3px solid ${disabledVisual ? "#A3AAAF" : accentColor};
          cursor: ${disabledVisual ? "not-allowed" : "pointer"};
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: all 0.2s ease;
          position: relative;
          z-index: 20;
        }

        input[type="range"]::-webkit-slider-thumb:hover:not(:disabled) {
          transform: scale(1.15);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
          border-width: 4px;
        }

        input[type="range"]::-webkit-slider-thumb:active:not(:disabled) {
          transform: scale(1.1);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
        }

        input[type="range"]:focus::-webkit-slider-thumb {
          box-shadow: 0 0 0 4px ${accentColor}40, 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        input[type="range"]::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: white;
          border: 3px solid ${disabledVisual ? "#A3AAAF" : accentColor};
          cursor: ${disabledVisual ? "not-allowed" : "pointer"};
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: all 0.2s ease;
          -moz-appearance: none;
        }

        input[type="range"]::-moz-range-thumb:hover:not(:disabled) {
          transform: scale(1.15);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
        }

        input[type="range"]::-moz-range-track {
          height: 12px;
          border-radius: 6px;
          background: transparent;
          border: none;
        }

        input[type="range"]::-ms-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: white;
          border: 3px solid ${disabledVisual ? "#A3AAAF" : accentColor};
          cursor: ${disabledVisual ? "not-allowed" : "pointer"};
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        input[type="range"]::-ms-track {
          height: 12px;
          border-radius: 6px;
          background: transparent;
          border: none;
          color: transparent;
        }

        /* Show progress indicator on hover/focus */
        .group:hover .progress-indicator {}
      `}</style>
    </div>
  );
}
