// src/pages/Home.jsx
import { useState } from "react";
import { motion } from "framer-motion";

export default function Home({ duel, isConnected }) {
  const [value, setValue] = useState(duel.name || "");
  const canStart = value.trim().length >= 2;

  function handleSubmit(e) {
    e.preventDefault();
    if (!canStart) return;
    duel.findMatch(value.trim());
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex flex-col items-center text-center gap-8 py-16"
    >
      {/* Title */}
      <div className="space-y-3">
        <p className="label-up">Prime Academy presents</p>
        <h1 className="chrome-text text-5xl sm:text-6xl">PRIME DUEL</h1>
        <p className="text-[#a89bc4] text-sm sm:text-base">
          Answer faster than your opponent. Win the duel.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div className="space-y-2 text-left">
          <label htmlFor="name" className="label-up">
            Your name
          </label>
          <input
            id="name"
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter a name"
            maxLength={16}
            autoFocus
            className="neon-input"
          />
        </div>

        <motion.button
          type="submit"
          disabled={!canStart}
          whileTap={canStart ? { scale: 0.97 } : undefined}
          className="btn-neon btn-cyan w-full"
        >
          Find Match
        </motion.button>
      </form>

      {/* Footer hint */}
      <p className="label-up" style={{ fontSize: 10 }}>
        5 questions · 10 seconds each
      </p>
    </motion.div>
  );
}
