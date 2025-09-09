import React from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Changes:
 * - Unique key for AnimatePresence child (avoids duplicate-key warning)
 * - Click on backdrop to close
 */
export default function Sheet({ open, title, children, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="sheet-backdrop"
          className="absolute inset-0 z-[70] flex items-end bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose?.();
          }}
        >
          <motion.div
            key="sheet-panel"
            className="w-full mx-auto max-w-[1100px] rounded-t-3xl border border-white/10 bg-[rgba(37,36,36,0.52)] p-6"
            initial={{ y: "22%" }}
            animate={{ y: "0%" }}
            exit={{ y: "22%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
          >
            <div className="text-white text-lg font-semibold mb-4">{title}</div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
