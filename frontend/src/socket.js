import { io } from "socket.io-client";

export const socket = io(
  "https://real-time-collaborative-to-do-board-qzkn.onrender.com/",
  {
    autoConnect: false, // we’ll call connect() after login
  }
);
