// src/pages/Arena.jsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TimerBar from "../components/TimerBar";
import ScoreChip from "../components/ScoreChip";
import AnswerButton from "../components/AnswerButton";

export default function Arena({ duel }) {
  const {
    question,
    qIndex,
    qTotal,
    durationMs,
    myScore,
    oppScore,
    opponentName,
    opponentStatus,
    lastRound,
    answer,
    name,
    questionStartedAt,
    myResult,
    opponentDisconnected,
  } = duel;

  useEffect(() => {
    console.log("myResult ", myResult);
  }, [myResult]);
  const [remaining, setRemaining] = useState(durationMs);
  const [selected, setSelected] = useState(null);
  const [locked, setLocked] = useState(false);

  // Reset per question + local countdown
  useEffect(() => {
    setSelected(null);
    setLocked(false);

    const tick = () => {
      const left = durationMs - (Date.now() - questionStartedAt);
      setRemaining(Math.max(0, left));
      if (left <= 0) setLocked(true); // no more clicks once time is up
      return left;
    };
    tick(); // correct value immediately, not after the first interval
    const id = setInterval(() => {
      if (tick() <= 0) clearInterval(id);
    }, 100);

    if (opponentDisconnected) {
      setLocked(true);
    }
    document.addEventListener("visibilitychange", tick);

    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [question?.id, durationMs, questionStartedAt, opponentDisconnected]);

  function handleAnswer(i) {
    if (locked) return;
    setSelected(i);
    setLocked(true);
    answer(i);
  }

  const bannerText = lastRound
    ? lastRound.timedOut
      ? "TIME'S UP"
      : lastRound.correct
        ? "CORRECT"
        : selected === null && lastRound.roundWinner === "opponent"
          ? "TOO SLOW"
          : "WRONG"
    : "";

  const bannerColor = lastRound
    ? lastRound.timedOut
      ? "#a89bc4"
      : lastRound.correct
        ? "#22e1ff"
        : "#ff2d95"
    : "#a89bc4";

  if (!question) return null;

  const correctIndex = lastRound?.correctIndex ?? null;

  // Round over: show the right answer, and your pick if it was wrong.
  const revealStates = lastRound
    ? question.options.map((_, i) => {
        if (i === correctIndex) return "correct";
        if (i === selected) return "wrong";
        return "disabled";
      })
    : null;

  // Round still running, but you already know you missed.
  function liveState(i) {
    if (selected === i) return myResult === "wrong" ? "wrong" : "selected";
    return locked ? "disabled" : "idle";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex flex-col gap-5 py-6"
    >
      {/* ---- SCOREBOARD ---- */}
      <div className="flex items-center justify-between gap-2">
        <ScoreChip label={name || "You"} score={myScore} variant="you" />

        <div className="flex flex-col items-center">
          <span className="label-up">
            {qIndex + 1} / {qTotal}
          </span>
        </div>

        <div className="flex flex-col items-end gap-1">
          <ScoreChip
            label={opponentName || "Opponent"}
            score={oppScore}
            variant="them"
          />
          <div className="h-5">
            <OpponentStatus status={opponentStatus} />
          </div>
        </div>
      </div>
      {opponentDisconnected && (
        <div className="label-up text-center" style={{ color: "#ff2d95" }}>
          Opponent disconnected, waiting up to{" "}
          {Math.round(opponentDisconnected.graceMs / 1000)}s...
        </div>
      )}
      {/* ---- TIMER ---- */}
      <TimerBar remainingMs={remaining} totalMs={durationMs} />

      {/* ---- QUESTION ---- */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.22 }}
          className="neon-panel px-5 py-5 min-h-[5.5rem] flex items-center"
        >
          <h2 className="text-lg sm:text-xl font-semibold leading-snug">
            {question.text}
          </h2>
        </motion.div>
      </AnimatePresence>

      {/* ---- ANSWERS (staggered snap-in) ---- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {question.options.map((opt, i) => (
          <motion.div
            key={`${question.id}-${i}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.06, ease: "easeOut" }}
          >
            <AnswerButton
              label={opt}
              index={i}
              state={revealStates ? revealStates[i] : liveState(i)}
              onClick={() => handleAnswer(i)}
            />
          </motion.div>
        ))}
      </div>

      {/* ---- REVEAL BANNER ---- */}
      <AnimatePresence>
        {lastRound && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex justify-center"
          >
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5
                   font-display font-bold tracking-widest text-sm"
              style={{
                background: "rgba(10,6,24,0.92)",
                border: `1px solid ${bannerColor}`,
                color: "#ffffff",
                boxShadow: `0 0 20px ${bannerColor}88, inset 0 0 14px ${bannerColor}22`,
                textShadow: `0 0 10px ${bannerColor}`,
              }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{
                  background: bannerColor,
                  boxShadow: `0 0 8px ${bannerColor}`,
                }}
              />
              {bannerText}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ---- opponent live status light ---- */
function OpponentStatus({ status }) {
  const map = {
    idle: { text: "", color: "transparent" },
    thinking: { text: "THINKING", color: "#ff2d95" },
    answered: { text: "ANSWERED", color: "#22e1ff" },
  };
  const s = map[status] || map.idle;

  return (
    <AnimatePresence mode="wait">
      {status !== "idle" && (
        <motion.div
          key={status}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-1.5"
        >
          <motion.span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: s.color, boxShadow: `0 0 8px ${s.color}` }}
            animate={
              status === "thinking" ? { opacity: [1, 0.3, 1] } : { opacity: 1 }
            }
            transition={
              status === "thinking"
                ? { duration: 1, repeat: Infinity }
                : { duration: 0.2 }
            }
          />
          <span
            className="font-display text-[9px] tracking-[0.2em]"
            style={{ color: s.color }}
          >
            {s.text}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
