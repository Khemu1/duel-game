import { motion } from "framer-motion";

export default function Matched({ duel }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex flex-col items-center text-center gap-10 py-20"
    >
      <p className="label-up">Opponent found</p>

      {/* Names */}
      <div className="flex items-center gap-6 sm:gap-10">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="space-y-1"
        >
          <p className="label-up" style={{ fontSize: 10 }}>
            You
          </p>
          <h2 className="font-display font-bold tracking-widest text-xl sm:text-2xl uppercase text-[#f5f0ff]">
            {duel.name}
          </h2>
        </motion.div>

        <motion.span
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.25, type: "spring", stiffness: 300 }}
          className="chrome-text text-3xl sm:text-4xl"
        >
          VS
        </motion.span>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="space-y-1"
        >
          <p className="label-up" style={{ fontSize: 10 }}>
            Opponent
          </p>
          <h2
            className="font-display font-bold tracking-widest text-xl sm:text-2xl uppercase"
            style={{ color: "#22e1ff", textShadow: "0 0 14px #22e1ff" }}
          >
            {duel.opponentName}
          </h2>
        </motion.div>
      </div>

      <motion.p
        className="label-up"
        animate={{ opacity: [1, 0.4, 1] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      >
        Preparing Questions...
      </motion.p>
    </motion.div>
  );
}
