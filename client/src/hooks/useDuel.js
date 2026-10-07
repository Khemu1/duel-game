import { useEffect, useRef, useState, useCallback } from "react";
import { socket } from "../lib/socket";

export const PHASE = {
  HOME: "home",
  SEARCHING: "searching",
  MATCHED: "matched",
  ARENA: "arena",
  FINAL: "final",
};

export function useDuel() {
  const [phase, setPhase] = useState(PHASE.HOME);
  const [name, setName] = useState("");
  const [opponentName, setOpponentName] = useState("");
  const [question, setQuestion] = useState(null);
  const [qIndex, setQIndex] = useState(0);
  const [qTotal, setQTotal] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [myScore, setMyScore] = useState(0);
  const [oppScore, setOppScore] = useState(0);
  const [lastRound, setLastRound] = useState(null);
  const [result, setResult] = useState(null);
  const [opponentStatus, setOpponentStatus] = useState("idle");
  const [questionStartedAt, setQuestionStartedAt] = useState(0);
  const [myResult, setMyResult] = useState(null);
  const scoresRef = useRef({ my: 0, opp: 0 }); // latest scores for the forfeit case
  const [opponentDisconnected, setOpponentDisconnected] = useState(null); // { graceMs } | null
  useEffect(() => {
    const onMatchFound = ({ opponentName }) => {
      setOpponentName(opponentName);
      setPhase(PHASE.MATCHED);
    };

    const onOpponentStatus = ({ status }) => setOpponentStatus(status);

    const onDuelStart = ({ totalQuestions }) => {
      setMyResult(null);
      scoresRef.current = { my: 0, opp: 0 };
      setQTotal(totalQuestions);
      setQIndex(0);
      setMyScore(0);
      setOppScore(0);
      setLastRound(null);
      setResult(null);
      setOpponentStatus("idle");
      setPhase(PHASE.ARENA);
    };

    const onQuestion = ({ index, total, question, durationMs }) => {
      setQuestionStartedAt(Date.now());
      setQIndex(index);
      setQTotal(total);
      setQuestion(question);
      setDurationMs(durationMs);
      setLastRound(null);
    };

    const onRoundEnd = (payload) => {
      scoresRef.current = { my: payload.myCorrect, opp: payload.oppCorrect };
      setMyScore(payload.myCorrect);
      setOppScore(payload.oppCorrect);
      setLastRound({
        correct: payload.correct ?? false,
        timedOut: payload.timedOut ?? false,
        correctIndex: payload.correctIndex ?? null,
        roundWinner: payload.roundWinner ?? null,
      });
    };

    const onDuelEnd = (payload) => {
      setResult(payload);
      setPhase(PHASE.FINAL);
      setOpponentDisconnected(null);
    };

    // opponent dropped mid-duel: you win by forfeit
    const onOpponentDisconnected = ({ graceMs }) => {
      setOpponentDisconnected({ graceMs, at: Date.now() });
    };

    socket.on("match-found", onMatchFound);
    socket.on("duel:opponentStatus", onOpponentStatus);
    socket.on("duel:start", onDuelStart);
    socket.on("duel:question", onQuestion);
    socket.on("duel:roundEnd", onRoundEnd);
    socket.on("duel:end", onDuelEnd);
    socket.on("opponent-disconnected", onOpponentDisconnected);

    return () => {
      socket.off("match-found", onMatchFound);
      socket.off("duel:opponentStatus", onOpponentStatus);
      socket.off("duel:start", onDuelStart);
      socket.off("duel:question", onQuestion);
      socket.off("duel:roundEnd", onRoundEnd);
      socket.off("duel:end", onDuelEnd);
      socket.off("opponent-disconnected", onOpponentDisconnected);
    };
  }, []);

  const joinQueue = useCallback((playerName) => {
    setPhase(PHASE.SEARCHING);
    socket.emit("join-waiting-room", { username: playerName }, (res) => {
      if (!res?.ok) {
        console.error(res?.error);
        setPhase(PHASE.HOME);
      }
    });
  }, []);

  const findMatch = useCallback(
    (playerName) => {
      setName(playerName);
      joinQueue(playerName);
    },
    [joinQueue],
  );

  const cancelSearch = useCallback(() => {
    socket.emit("leave-waiting-room", {}, (res) => {
      if (res?.ok) setPhase(PHASE.HOME);
    });
  }, []);

  const answer = useCallback(
    (choice) => {
      if (!question) return;
      socket.emit(
        "duel:answer",
        { answerIndex: choice, questionId: question.id },
        (res) => {
          console.log("duel:answer ", res);
          if (res?.ok) {
            console.log("ress is ok boi");
            setMyResult(res.correct ? "correct" : "wrong");
          }
        },
      );
    },
    [question],
  );

  const playAgain = useCallback(() => {
    setResult(null);
    setLastRound(null);
    joinQueue(name);
  }, [joinQueue, name]);

  return {
    phase,
    name,
    opponentName,
    question,
    qIndex,
    qTotal,
    durationMs,
    myScore,
    oppScore,
    opponentStatus,
    lastRound,
    result,
    findMatch,
    cancelSearch,
    answer,
    playAgain,
    questionStartedAt,
    myResult,
    opponentDisconnected,
  };
}
