import { io } from "socket.io-client";

export const socket = io("http://localhost:3000", {
  withCredentials: true,        // ⛔ don’t connect immediately
  transports: ["websocket"]
});
