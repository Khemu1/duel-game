import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Searching({ duel }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      setElapsed((Date.now() - start) / 1000);
    }, 100);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex flex-col items-center text-center gap-10 py-20"
    >
      {/* Radar */}
      <div className="relative h-36 w-36 flex items-center justify-center">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="absolute inset-0 rounded-full"
            style={{ border: "1px solid rgba(34,225,255,0.5)" }}
            initial={{ scale: 0.5, opacity: 0.7 }}
            animate={{ scale: 1.7, opacity: 0 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut",
              delay: i * 0.65,
            }}
          />
        ))}
        <div
          className="relative h-16 w-16 rounded-full flex items-center justify-center"
          style={{
            background: "rgba(34,225,255,0.08)",
            border: "1px solid rgba(34,225,255,0.6)",
            boxShadow:
              "0 0 26px rgba(34,225,255,0.45), inset 0 0 18px rgba(34,225,255,0.15)",
          }}
        >
          <motion.div
            className="h-3 w-3 rounded-full"
            style={{ background: "#22e1ff", boxShadow: "0 0 14px #22e1ff" }}
            animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* Text */}
      <div className="space-y-2">
        <h2 className="font-display font-bold tracking-widest text-lg uppercase text-[#f5f0ff]">
          Scanning for opponent
        </h2>
        <p className="label-up">
          {duel.name ? `Queued as ${duel.name}` : "In queue"} ·{" "}
          {elapsed.toFixed(1)}s
        </p>
      </div>

      {/* Cancel */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={duel.cancelSearch}
        className="btn-ghost"
      >
        Cancel
      </motion.button>
    </motion.div>
  );
}
