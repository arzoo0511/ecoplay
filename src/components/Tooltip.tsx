import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close tooltip when clicking or tapping outside (important for mobile)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const handleMouseEnter = () => {
    // Only trigger hover on devices that support true hover
    if (window.matchMedia("(hover: hover)").matches) {
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (window.matchMedia("(hover: hover)").matches) {
      setIsOpen(false);
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    // On touch devices, toggle visibility on tap/click
    if (!window.matchMedia("(hover: hover)").matches) {
      e.stopPropagation();
      setIsOpen(!isOpen);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center w-full h-full cursor-help select-none"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleToggle}
    >
      {children}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 6 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute bottom-full mb-3 z-50 w-52 px-3.5 py-2.5 text-xs text-center text-slate-100 bg-slate-950/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl pointer-events-none"
          >
            {content}
            {/* Tooltip Arrow */}
            <div 
              className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-slate-950/95"
              style={{ borderTopColor: "rgba(2, 6, 23, 0.95)" }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tooltip;
