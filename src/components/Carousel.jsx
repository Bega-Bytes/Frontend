import React from "react";
import { Thermometer, Fan, User, Lightbulb, Volume2, Bell } from "lucide-react";

const tabs = [
  { key: "climate", icon: Thermometer, label: "Climate" },
  { key: "fans", icon: Fan, label: "Fans" },
  { key: "seats", icon: User, label: "Seats" },
  { key: "lighting", icon: Lightbulb, label: "Lighting" },
  { key: "audio", icon: Volume2, label: "Audio" },
  { key: "notify", icon: Bell, label: "Alerts" },
];

export default function Carousel({ page, setPage }) {
  return (
    <div className="flex justify-center gap-3 py-4 px-5 rounded-2xl bg-[#111318]/60 border border-white/10">
      {tabs.map(({ key, icon: Icon, label }) => {
        const active = page === key;
        return (
          <button
            key={key}
            onClick={() => setPage(key)}
            className={`w-10 h-10 rounded-xl grid place-items-center transition
              ${
                active
                  ? "bg-[var(--brand)] text-black"
                  : "bg-white/5 text-white/80 hover:bg-white/10"
              }`}
            aria-label={label}
            title={label}
          >
            <Icon size={18} />
          </button>
        );
      })}
    </div>
  );
}
