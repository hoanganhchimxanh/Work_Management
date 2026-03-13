import { io } from "socket.io-client";
import config from "./configs/api";

export const socket = io(`${config.backendBase}`, {
  auth: (cb) => {
    cb({
      token: localStorage.getItem("token")
    });
  }
});

