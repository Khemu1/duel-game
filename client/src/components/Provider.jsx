// src/context/DuelContext.jsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { socket } from "../lib/socket";

const DuelContext = createContext(null);

export function DuelProvider({ children }) {
  const [isConnected, setIsConnected] = useState(socket.connected);

  const onConnect = useCallback(() => setIsConnected(true), []);
  const onDisconnect = useCallback(() => setIsConnected(false), []);

  useEffect(() => {
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    setIsConnected(socket.connected);
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [onConnect, onDisconnect]);

  return (
    <DuelContext.Provider value={{ socket, isConnected }}>
      {children}
    </DuelContext.Provider>
  );
}

export function useDuelSocket() {
  const ctx = useContext(DuelContext);
  if (!ctx) {
    throw new Error("useDuelSocket must be used within <DuelProvider>");
  }
  return ctx;
}
