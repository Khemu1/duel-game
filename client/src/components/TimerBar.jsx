// src/components/TimerBar.jsx
// Segmented countdown. SEGMENTS blocks light up; as time drains they wink
// out one by one. Last few segments go pink and pulse. Number on the right.
import { motion } from "framer-motion";

const SEGMENTS = 10;

export default function TimerBar({ remainingMs, totalMs }) {
  const pct = Math.max(0, Math.min(1, remainingMs / totalMs));

  // How many segments are still lit. ceil so it hits 0 only at true zero.
  const litCount = Math.ceil(pct * SEGMENTS);

  const seconds = Math.ceil(remainingMs / 1000);
  const low = pct <= 0.3 && pct > 0;

  // color for the number, as light
  const numColor = pct > 0.5 ? "#22e1ff" : pct > 0.3 ? "#ffd166" : "#ff2d95";

  return (
    <div className="flex items-center gap-3 w-full">
      {/* The segments */}
      <div className="flex-1 flex gap-1.5">
        {Array.from({ length: SEGMENTS }).map((_, i) => {
          const lit = i < litCount;
          // last 3 segments are "danger" colored when lit
          const danger = i >= SEGMENTS - 3;
          const color = danger ? "#ff2d95" : "#22e1ff";

          return (
            <motion.div
              key={i}
              className="h-3 flex-1 rounded-sm"
              animate={
                lit
                  ? {
                      backgroundColor: color,
                      boxShadow: `0 0 12px ${color}aa, inset 0 0 6px ${color}66`,
                      opacity: 1,
                    }
                  : {
                      backgroundColor: "rgba(168,155,196,0.12)",
                      boxShadow: "none",
                      opacity: 0.5,
                    }
              }
              transition={{ duration: 0.25, ease: "easeOut" }}
            />
          );
        })}
      </div>

      {/* Seconds number */}
      <motion.span
        className="font-display font-bold text-xl tabular-nums w-9 text-right"
        style={{ color: numColor, textShadow: `0 0 14px ${numColor}` }}
        animate={low ? { scale: [1, 1.12, 1] } : { scale: 1 }}
        transition={
          low ? { duration: 0.6, repeat: Infinity } : { duration: 0.2 }
        }
      >
        {seconds}
      </motion.span>
    </div>
  );
}
