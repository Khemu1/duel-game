// src/components/ScoreChip.jsx
import { motion, AnimatePresence } from "framer-motion";

export default function ScoreChip({ label, score, variant = "you" }) {
  const isYou = variant === "you";

  return (
    <div
      className={`flex items-center gap-3 rounded-xl px-3 py-2 border backdrop-blur-sm 
        ${
          isYou
            ? "border-cyan-400/60 shadow-[0_0_18px_rgba(34,225,255,0.25)]"
            : "border-pink-500/60 shadow-[0_0_18px_rgba(255,45,149,0.25)]"
        }`}
      style={{ background: "rgba(15,6,32,0.7)" }}
    >
      <span className="label-up" style={{ fontSize: 10 }}>
        {label}
      </span>
      <div className="relative w-6 h-6 flex items-center justify-center">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={score}
            initial={{ y: -14, opacity: 0, scale: 1.3 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 14, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className={`absolute font-display font-bold text-lg tabular-nums
              ${isYou ? "score-you" : "score-them"}`}
          >
            {score}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
