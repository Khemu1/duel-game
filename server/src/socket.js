import { Server, Socket } from "socket.io";
import { randomUUID } from "crypto";
import { DUEL_CONFIG, pickQuestions } from "./data/questions.js";
import { finishRound, forfeitMatch, startDuel } from "./helpers/index.js";
/**
 * @type {Map<string,{id:string ,socket:Socket ,roomId:string|null ,timer:NodeJS.Timeout | null,username:string|null}>}
 */
export const players = new Map(); // playerId -> { id, socket, roomId, timer }
/**
 * @type {string[]}
 */
const waitingQueue = []; // playerIds

/**
 * @typedef {{ correct: number, totalTime: number }} PlayerScore
 *
 * @typedef {Object} Match
 * @property {string[]} players                      playerIds [idA, idB]
 * @property {Array<{ id: string, text: string, options: string[], correctIndex: number }>} questions  server only, includes correctIndex
 * @property {number} index                          current question index
 * @property {Record<string, PlayerScore>} scores    keyed by playerId
 * @property {Set<string>} answered                  playerIds who answered this round
 * @property {number} roundStart                     Date.now() when the question was sent
 * @property {NodeJS.Timeout | null} roundTimer      timeout handle for the current round
 * @property {boolean} roundOpen
 * @property {string | null} roundWinner
 * @property {NodeJS.Timeout | null} nextTimer      pause timer between rounds
 * @property {string} activeQuestionId
 *
 */

/**
 * @type {Map<string, Match>}
 */
export const matches = new Map(); // roomId -> Match

const MATCH_START_DELAY_MS = 2000;
const GRACE_MS = 5000;

export default function createSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:5173"],
      methods: ["GET", "POST"],
    },
  });
  io.use((socket, next) => {
    const playerId = socket.handshake.auth?.playerId;
    if (!playerId) {
      console.log("missing playerId");
      return next(new Error("playerId required"));
    }
    socket.data.playerId = playerId;
    next();
  });

  io.on("connection", (socket) => {
    const { playerId } = socket.data;
    players.set(playerId, {
      id: playerId,
      socket,
      roomId: null,
      timer: null,
      username: null,
    });

    console.log("onConnection", playerId);

    socket.on("disconnect", () => {
      const player = players.get(playerId);
      if (!player || player.socket !== socket) return; // stale socket

      const idx = waitingQueue.indexOf(playerId);
      if (idx !== -1) waitingQueue.splice(idx, 1);

      const roomId = player.roomId;
      const match = roomId && matches.get(roomId);

      // not in a match: nothing to wait for
      if (!match) {
        players.delete(playerId);
        return;
      }

      // in a match: keep everything running and start the grace timer
      const opponentId = match.players.find((id) => id !== playerId);
      players
        .get(opponentId)
        ?.socket.emit("opponent-disconnected", { graceMs: GRACE_MS });

      player.timer = setTimeout(
        () => forfeitMatch(roomId, playerId, io),
        GRACE_MS,
      );
    });

    socket.on("join-waiting-room", (data, callback) => {
      console.log("player tring to join wating room ", playerId, data);
      const player = players.get(playerId);

      if (!player || player.roomId || waitingQueue.includes(playerId)) {
        return callback?.({ ok: false, error: "already queued or in match" });
      }

      const username =
        typeof data?.username === "string"
          ? data.username.trim().slice(0, 20)
          : "";
      if (!username) {
        return callback?.({ ok: false, error: "username required" });
      }
      player.username = username;

      waitingQueue.push(playerId);
      callback?.({ ok: true });
      console.log(
        "player , ",
        playerId,
        "with username ",
        data.username,
        " joined waiting room",
      );
      if (waitingQueue.length > 1) {
        const playersToMatch = waitingQueue.splice(0, 2);
        const roomId = randomUUID();
        const playerOne = players.get(playersToMatch[0]);
        const playerTwo = players.get(playersToMatch[1]);

        for (const p of [playerOne, playerTwo]) {
          p.socket.join(roomId);
          p.roomId = roomId;
        }
        matches.set(roomId, {
          players: playersToMatch,
          questions: pickQuestions(),
          index: 0,
          scores: {
            [playerOne.id]: { correct: 0, totalTime: 0 },
            [playerTwo.id]: { correct: 0, totalTime: 0 },
          },
          answered: new Set(),
          roundStart: 0,
          roundTimer: null,
          roundOpen: true,
          roundWinner: null,
          nextTimer: null,
          activeQuestionId: null,
        });

        playerOne.socket.emit("match-found", {
          roomId,
          opponentId: playerTwo.id,
          opponentName: playerTwo.username,
        });
        playerTwo.socket.emit("match-found", {
          roomId,
          opponentId: playerOne.id,
          opponentName: playerOne.username,
        });

        setTimeout(() => startDuel(roomId, io), MATCH_START_DELAY_MS);
      }
    });

    socket.on("duel:answer", (data, callback) => {
      console.log("duel:answer called ", data);
      const { answerIndex } = data ?? {};

      const player = players.get(playerId);
      if (!player?.roomId) return;
      const roomId = player.roomId;

      const match = matches.get(roomId);

      if (!match) {
        console.log("match isn't found ");
        return callback?.({ ok: false, error: "round closed" });
      }
      if (!match.roundOpen) {
        console.log("round is already closed");
        return callback?.({ ok: false, error: "round closed" });
      }
      if (match.answered.has(playerId)) {
        console.log("player already answerd the question");
        return callback?.({ ok: false, error: "already answered" });
      }

      const question = match.questions.find(
        (q) => q.id == match.activeQuestionId,
      );
      const isCorrect = answerIndex === question.correctIndex;

      if (
        !Number.isInteger(answerIndex) ||
        answerIndex < 0 ||
        answerIndex >= question.options.length
      ) {
        console.log("this answer doesn't exist ");
        return callback?.({ ok: false, error: "invalid answer" });
      }

      match.answered.add(playerId);
      callback?.({ ok: true, correct: isCorrect });

      if (isCorrect) {
        const score = match.scores[playerId];
        score.correct += DUEL_CONFIG.POINTS_PER_CORRECT;
        score.totalTime += Date.now() - match.roundStart;
        match.roundWinner = playerId;
        return finishRound(roomId, io, match.index);
      }

      // wrong answer
      if (match.answered.size === 2) {
        console.log("all players answerd wrong");
        return finishRound(roomId, io, match.index); // both wrong, no winner
      }
      socket.to(roomId).emit("duel:opponentStatus", { status: "answered" });
    });
    socket.on("leave-waiting-room", (_data, callback) => {
      console.log("user trying to leave wating room ", playerId);
      const idx = waitingQueue.indexOf(playerId);
      if (idx !== -1) waitingQueue.splice(idx, 1);
      const player = players.get(playerId);
      if (player?.roomId) {
        return callback?.({ ok: false });
      }
      callback?.({ ok: true });
    });
  });

  return io;
}
