// src/App.jsx
import { useDuel, PHASE } from "./hooks/useDuel";
import { AnimatePresence } from "framer-motion";

import World from "./components/World";
import Home from "./pages/Home";
import Searching from "./pages/Searching";
import Arena from "./pages/Arena";
import Final from "./pages/Final";
import Matched from "./pages/Matched";

export default function App() {
  const duel = useDuel();

  return (
    <div className="min-h-screen relative">
      <World fast={duel.phase === PHASE.SEARCHING} />

      {/* Screens float above the world */}
      <div className="world-content min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            {duel.phase === PHASE.HOME && <Home key="home" duel={duel} />}
            {duel.phase === PHASE.SEARCHING && (
              <Searching key="searching" duel={duel} />
            )}
            {duel.phase === PHASE.MATCHED && (
              <Matched key="matched" duel={duel} />
            )}
            {duel.phase === PHASE.ARENA && <Arena key="arena" duel={duel} />}
            {duel.phase === PHASE.FINAL && <Final key="final" duel={duel} />}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
