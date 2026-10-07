import { Server } from "socket.io";
import { matches, players } from "../socket.js";
import { DUEL_CONFIG } from "../data/questions.js";
const ROUND_PAUSE_MS = 1400;

/**
 *
 * @param {string} roomId
 * @param {Server} io
 * @returns
 */
export const startDuel = (roomId, io) => {
  const match = matches.get(roomId);
  if (!match) return; // someone left during the delay

  io.to(roomId).emit("duel:start", {
    totalQuestions: match.questions.length,
  });
  sendQuestion(roomId, io);
};

/**
 *
 * @param {string} roomId
 * @param {Server} io
 * @returns
 */

export const sendQuestion = (roomId, io) => {
  const match = matches.get(roomId);
  if (!match) return;

  const question = match.questions[match.index];
  if (!question) return; // index ran past the end

  clearTimeout(match.roundTimer); // never let a stale timer survive
  match.answered.clear();
  match.roundStart = Date.now();
  match.roundOpen = true;
  match.activeQuestionId = question.id;
  io.to(roomId).emit("duel:question", {
    index: match.index,
    total: match.questions.length,
    question: {
      id: question.id,
      text: question.text,
      options: question.options,
    },
    durationMs: DUEL_CONFIG.TIME_PER_QUESTION_MS,
  });
  io.to(roomId).emit("duel:opponentStatus", { status: "thinking" });
  const roundIndex = match.index;
  match.roundTimer = setTimeout(() => {
    finishRound(roomId, io, roundIndex);
  }, DUEL_CONFIG.TIME_PER_QUESTION_MS);
};

export const finishRound = (roomId, io, roundIndex) => {
  const match = matches.get(roomId);
  if (!match || roundIndex !== match.index || !match.roundOpen) return;

  match.roundOpen = false;
  clearTimeout(match.roundTimer);

  const question = match.questions[match.index];
  const winner = match.roundWinner;
  const [a, b] = match.players;

  for (const [me, opp] of [
    [a, b],
    [b, a],
  ]) {
    players.get(me)?.socket.emit("duel:roundEnd", {
      index: match.index,
      myCorrect: match.scores[me].correct,
      oppCorrect: match.scores[opp].correct,
      correct: winner === me,
      roundWinner: winner === null ? null : winner === me ? "you" : "opponent",
      timedOut: winner === null && !match.answered.has(me),
      correctIndex: question.correctIndex,
    });
  }
  io.to(roomId).emit("duel:opponentStatus", { status: "idle" });

  match.nextTimer = setTimeout(() => {
    if (!matches.has(roomId)) return; // someone left during the pause
    match.index += 1;
    if (match.index >= match.questions.length) endDuel(roomId, io);
    else sendQuestion(roomId, io);
  }, ROUND_PAUSE_MS);
};

const DRAW_THRESHOLD_MS = 250;

/**
 * Shared cleanup: stop timers, empty the room, free both players, delete the match.
 * Does NOT emit anything, so callers notify first and then call this.
 * @param {string} roomId
 * @param {Server} io
 */
export const destroyMatch = (roomId, io) => {
  const match = matches.get(roomId);
  if (!match) return;

  clearTimeout(match.roundTimer);
  clearTimeout(match.nextTimer);
  match.roundOpen = false;

  for (const id of match.players) {
    const p = players.get(id);
    if (!p) continue;
    p.socket.leave(roomId);
    p.roomId = null;
  }

  matches.delete(roomId);
};

/**
 * @param {string} roomId
 * @param {Server} io
 */
export const endDuel = (roomId, io) => {
  const match = matches.get(roomId);
  if (!match) return;

  const [idA, idB] = match.players;
  const a = match.scores[idA];
  const b = match.scores[idB];

  let draw = false;
  let winner = null;

  if (a.correct !== b.correct) {
    winner = a.correct > b.correct ? idA : idB;
  } else if (Math.abs(a.totalTime - b.totalTime) < DRAW_THRESHOLD_MS) {
    draw = true;
  } else {
    winner = a.totalTime < b.totalTime ? idA : idB;
  }

  for (const [me, opp] of [
    [idA, idB],
    [idB, idA],
  ]) {
    players.get(me)?.socket.emit("duel:end", {
      draw,
      youWin: winner === me,
      you: match.scores[me],
      opponent: match.scores[opp],
    });
  }

  destroyMatch(roomId, io);
};

/**
 * The leaver didn't come back in time: the opponent wins.
 * @param {string} roomId
 * @param {string} leaverId
 * @param {Server} io
 */
export const forfeitMatch = (roomId, leaverId, io) => {
  const leaver = players.get(leaverId);
  if (leaver) leaver.timer = null;

  const match = matches.get(roomId);

  // match already ended (finished normally, or the opponent forfeited first)
  if (!match) {
    players.delete(leaverId);
    return;
  }

  const oppId = match.players.find((id) => id !== leaverId);

  // same shape as a normal duel:end, plus forfeit: true
  players.get(oppId)?.socket.emit("duel:end", {
    draw: false,
    youWin: true,
    forfeit: true,
    you: match.scores[oppId],
    opponent: match.scores[leaverId],
  });

  destroyMatch(roomId, io);
  players.delete(leaverId);
};
