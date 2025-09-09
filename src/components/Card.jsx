import React from "react";

export default function Card({ title, icon: Icon, children, onOpen }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpen?.()}
      className="text-left w-full rounded-2xl border p-5 transition
        border-white/10 bg-[rgba(37,36,36,0.52)] hover:bg-white/[0.12] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
    >
      <div className="flex items-center gap-2 text-white/80">
        {Icon && (
          <div className="grid place-items-center w-8 h-8 rounded-lg bg-[var(--brand)]/20 text-white">
            <Icon size={16} />
          </div>
        )}
        <div className="font-medium">{title}</div>
      </div>
      <div className="text-white/80 text-sm mt-3">{children}</div>
    </div>
  );
}
