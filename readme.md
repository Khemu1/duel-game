# Prime Duel

A real-time 1v1 quiz duel. Two players are matched, race through a set of questions, and the first correct answer wins each round. Everything runs locally over WebSockets, with no database. All game state lives in server memory.

## Features

- **Matchmaking queue** with duplicate-join protection and cancel
- **Server-authoritative game**: questions and correct answers stay on the server, and clients only send answers
- **First-correct-wins rounds**: a wrong answer locks you out of that question, and the opponent can still answer
- **Round timer** enforced by the server, with late answers rejected
- **Answer reveal** after each round: your wrong pick and the correct option are both highlighted
- **Live opponent status** (thinking / answered) that never leaks whether the answer was right
- **Final result** with tie-break on total answer time, and a draw when times are nearly equal
- **Disconnect handling**: if a player drops mid-duel, the opponent waits 5 seconds and then wins by forfeit
- **Background-tab safe countdown**: the timer is derived from when the question arrived, not from ticks

## Tech stack

- **Server:** Node.js (ESM), Socket.IO
- **Client:** React, Vite, Tailwind CSS, Framer Motion, socket.io-client

## Project structure

```
duel-game/
├── server/
│   └── src/
│       ├── socket.js          # connection handling, matchmaking, answer handler
│       ├── duel.js            # startDuel, sendQuestion, finishRound, endDuel, destroyMatch, forfeitMatch
│       └── data/
│           └── questions.js   # QUESTIONS and DUEL_CONFIG (server only)
└── client/
    └── src/
        ├── lib/socket.js          # shared socket singleton + per-tab playerId
        ├── context/DuelContext.jsx
        ├── hooks/useDuel.js       # game state machine driven by socket events
        ├── pages/                 # Home, Searching, Matched, Arena, Final
        └── components/            # TimerBar, ScoreChip, AnswerButton, World
```

Adjust folder names above to match your repo.

## Getting started

### Prerequisites

- Node.js 18 or newer

### Run the server

```bash
cd server
npm install
npm run dev        # or: node src/index.js
```

The server listens on port **4005**.

### Run the client

```bash
cd client
npm install
npm run dev
```

The client runs on `http://localhost:5173`. Vite proxies `/socket.io` to `http://localhost:4005` (see `vite.config.js`), so no CORS setup is needed in the browser.

### Play

Open the client in **two separate tabs** (not "Duplicate tab", because that copies `sessionStorage` and both tabs would share one player ID). Enter a different name in each, click **Find Match**, and play.

## How it works

### Player identity

The client generates a `playerId` (stored in `sessionStorage`, so each tab is its own player) and sends it in the Socket.IO handshake `auth`. The server uses it as the key for each player rather than `socket.id`.

### Game flow

```
join-waiting-room  ->  match-found  ->  (short pause)  ->  duel:start
                                                              |
                          duel:question  <-----------------+  |
                               |                           |  |
                          duel:answer (first correct wins, or timeout)
                               |                           |
                          duel:roundEnd (per player) ------+
                               |
                          duel:end (per player)
```

### Socket events

**Client to server**

| Event | Payload | Purpose |
| --- | --- | --- |
| `join-waiting-room` | `{ username }` (ack: `{ ok, error? }`) | Enter the matchmaking queue |
| `leave-waiting-room` | `{}` (ack: `{ ok }`) | Cancel searching |
| `duel:answer` | `{ answerIndex, questionId }` (ack: `{ ok, correct? }`) | Submit an answer |

**Server to client**

| Event | Payload | Purpose |
| --- | --- | --- |
| `match-found` | `{ roomId, opponentId, opponentName }` | Opponent found, sent per player |
| `duel:start` | `{ totalQuestions }` | Switch to the arena |
| `duel:question` | `{ index, total, question: { id, text, options }, durationMs }` | Next question, with no `correctIndex` |
| `duel:opponentStatus` | `{ status: "thinking" \| "answered" \| "idle" }` | Live opponent indicator |
| `duel:roundEnd` | `{ index, myCorrect, oppCorrect, correct, roundWinner, timedOut, correctIndex }` | Round result from each player's point of view |
| `duel:end` | `{ draw, youWin, forfeit?, you, opponent }` | Final result |
| `opponent-disconnected` | `{ graceMs }` | Opponent dropped, waiting before forfeit |

### Server state

All state is in memory (`players`, `waitingQueue`, `matches`). Each match holds its questions, current index, per-player scores, who has answered, the round timers, and a `roundOpen` flag that closes the round the moment someone answers correctly or time runs out.

## Configuration

Edit `server/src/data/questions.js`:

- `TIME_PER_QUESTION_MS`: time per question (10000 recommended)
- `QUESTIONS_PER_DUEL`: how many questions per match
- `POINTS_PER_CORRECT`: points for a correct answer
- `QUESTIONS`: the question bank, each with `id`, `text`, `options`, and `correctIndex`

Other constants live in the server code: `GRACE_MS` (disconnect wait, 5000), `ROUND_PAUSE_MS` (pause between rounds, 1400), `MATCH_START_DELAY_MS` (matched screen duration, 2000), and `DRAW_THRESHOLD_MS` (250).

## Known limitations

- **No reconnect.** Refreshing mid-duel counts as a disconnect, and the opponent wins after the grace period.
- **In-memory only.** Restarting the server clears all queues and matches.
- **Client-generated player IDs.** Fine for local use, but anyone could claim another player's ID if this were deployed.
- **No rate limiting** on socket events.

## Ideas for later

- Reconnect with `match-resumed` state restore
- Online player count and queue position
- Server-issued player IDs
- Larger question bank and categories