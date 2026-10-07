import { io } from "socket.io-client";

export const socket = io("http://localhost:5173", {
  transports: ["websocket"],
  auth: { playerId: getPlayerId() },
});
function getPlayerId() {
  let id = sessionStorage.getItem("playerId");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("playerId", id);
  }
  return id;
}
