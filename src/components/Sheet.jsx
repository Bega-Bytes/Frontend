import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

// Dava Brand Colors
const COLORS = {
  primary: "#192B37",
  accent: "#3DD17B", 
  secondary: "#F99C11",
  gray: "#47555F",
  lightBg: "#E8EAEB",
  neutralBg: "#D1D5D7",
  textSecondary: "#A3AAAF"
};

/**
 * Enhanced Sheet component with Dava branding
 * Features smooth animations, better accessibility, and professional styling
 */
export default function Sheet({ open, title, children, onClose }) {
  // Handle escape key
  React.useEffect(() => {
    if (!open) return;
    
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };
    
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  // Prevent body scroll when sheet is open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  return (
    <AnimatePresence mode="wait">
      {open && (
        <motion.div
          key="sheet-backdrop"
          className="fixed inset-0 z-50 flex items-end"
          style={{ 
            backgroundColor: "rgba(25, 43, 55, 0.4)",
            backdropFilter: "blur(8px)"
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              onClose?.();
            }
          }}
        >
          <motion.div
            key="sheet-panel"
            className="w-full mx-auto max-w-4xl rounded-t-3xl bg-white shadow-2xl border-t border-l border-r overflow-hidden"
            style={{ 
              borderColor: "rgba(25, 43, 55, 0.1)",
              maxHeight: "80vh"
            }}
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "100%" }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 32,
              mass: 0.8
            }}
          >
            {/* Header */}
            <div 
              className="sticky top-0 z-10 px-6 py-4 border-b bg-white/95 backdrop-blur-sm"
              style={{ borderColor: "rgba(25, 43, 55, 0.1)" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 
                    className="text-xl font-bold mb-1"
                    style={{ color: COLORS.primary }}
                  >
                    {title}
                  </h2>
                  <p 
                    className="text-sm"
                    style={{ color: COLORS.textSecondary }}
                  >
                    Adjust settings below
                  </p>
                </div>
                
                <button
                  onClick={onClose}
                  className="p-2 rounded-full transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ 
                    backgroundColor: COLORS.lightBg,
                    color: COLORS.gray,
                    focusRingColor: COLORS.accent
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = COLORS.neutralBg;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = COLORS.lightBg;
                  }}
                  aria-label="Close settings panel"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6 overflow-y-auto" style={{ maxHeight: "calc(80vh - 120px)" }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                {children}
              </motion.div>
            </div>

            {/* Footer - Optional gradient fade */}
            <div 
              className="h-6 pointer-events-none"
              style={{
                background: "linear-gradient(to top, white, transparent)"
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}