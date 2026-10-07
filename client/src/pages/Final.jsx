// src/pages/Final.jsx
import { motion } from "framer-motion";

export default function Final({ duel }) {
  const { result, name, opponentName, playAgain, leave } = duel;

  if (!result) return null;

  const { youWin, draw, you, opponent } = result;

  const headline = draw ? "DRAW" : youWin ? "VICTORY" : "DEFEAT";
  const color = draw ? "#a89bc4" : youWin ? "#22e1ff" : "#ff2d95";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="relative flex flex-col items-center text-center gap-8 py-16"
    >
      {/* color flood behind the verdict */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background: `radial-gradient(60% 50% at 50% 40%, ${color}44 0%, transparent 70%)`,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      />

      {/* Verdict */}
      <motion.h1
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="font-display font-black tracking-widest text-5xl sm:text-6xl"
        style={{ color, textShadow: `0 0 50px ${color}` }}
      >
        {headline}
      </motion.h1>

      {/* Score cards */}
      <div className="w-full max-w-sm grid grid-cols-2 gap-3">
        <ScoreCard
          label={name || "You"}
          score={you.correct}
          time={you.totalTime}
          variant="you"
          winner={youWin && !draw}
          delay={0.15}
        />
        <ScoreCard
          label={opponentName || "Opponent"}
          score={opponent.correct}
          time={opponent.totalTime}
          variant="them"
          winner={!youWin && !draw}
          delay={0.25}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={playAgain}
          className="btn-neon btn-cyan"
        >
          Play Again
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={leave}
          className="btn-ghost"
        >
          Leave
        </motion.button>
      </div>
    </motion.div>
  );
}

function ScoreCard({ label, score, time, variant, winner, delay }) {
  const isYou = variant === "you";
  const color = isYou ? "#22e1ff" : "#ff2d95";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-2xl p-4 flex flex-col items-center gap-1"
      style={{
        background: "rgba(15,6,32,0.72)",
        border: `1px solid ${winner ? color : "rgba(168,155,196,0.25)"}`,
        boxShadow: winner
          ? `0 0 30px ${color}66, inset 0 0 22px ${color}22`
          : "none",
      }}
    >
      <span className="label-up">{label}</span>
      <span
        className="font-display font-black text-3xl tabular-nums"
        style={{ color, textShadow: `0 0 18px ${color}aa` }}
      >
        {score}
      </span>
      <span className="label-up" style={{ fontSize: 10 }}>
        {(time / 1000).toFixed(1)}s total
      </span>
    </motion.div>
  );
}
