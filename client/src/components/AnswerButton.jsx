// src/components/AnswerButton.jsx
import { motion } from "framer-motion";

export default function AnswerButton({ label, index, state, onClick }) {
  const letter = String.fromCharCode(65 + index);
  const interactive = state === "idle";

  // Each state maps to border / fill / glow. Neon as light, not flat fill.
  const visuals = {
    idle: {
      border: "rgba(139,92,246,0.5)",
      bg: "rgba(15,6,32,0.7)",
      glow: "0 0 0 rgba(0,0,0,0)",
      text: "#f5f0ff",
    },
    selected: {
      border: "#22e1ff",
      bg: "rgba(34,225,255,0.14)",
      glow: "0 0 22px rgba(34,225,255,0.5)",
      text: "#ffffff",
    },
    correct: {
      border: "#22e1ff",
      bg: "rgba(34,225,255,0.22)",
      glow: "0 0 34px rgba(34,225,255,0.85)",
      text: "#ffffff",
    },
    wrong: {
      border: "#ff2d95",
      bg: "rgba(255,45,149,0.2)",
      glow: "0 0 30px rgba(255,45,149,0.8)",
      text: "#ffffff",
    },
    disabled: {
      border: "rgba(139,92,246,0.2)",
      bg: "rgba(15,6,32,0.45)",
      glow: "0 0 0 rgba(0,0,0,0)",
      text: "#6b5f85",
    },
  };
  const v = visuals[state] || visuals.idle;

  return (
    <motion.button
      type="button"
      onClick={interactive ? onClick : undefined}
      disabled={!interactive}
      whileTap={interactive ? { scale: 0.98 } : undefined}
      animate={{
        borderColor: v.border,
        backgroundColor: v.bg,
        boxShadow: v.glow,
        // a satisfying snap on correct
        scale: state === "correct" ? [1, 1.04, 1] : 1,
      }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="w-full text-left rounded-xl border px-4 py-3.5 flex items-center gap-3 backdrop-blur-sm"
      style={{ color: v.text }}
    >
      <span
        className="flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center
                   font-display font-bold text-sm"
        style={{
          border: `1px solid ${v.border}`,
          color: v.text,
          background: "rgba(10,6,24,0.6)",
        }}
      >
        {letter}
      </span>
      <span className="text-sm sm:text-base font-medium">{label}</span>
    </motion.button>
  );
}
