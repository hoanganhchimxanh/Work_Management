const { Server } = require("socket.io");

let io = null;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Admin tham gia room riêng để nhận thông báo
    socket.on("join-admin-room", (data) => {
      const { role } = data;
      if (role === "ADMIN") {
        socket.join("admin-room");
        console.log(`Admin joined room: ${socket.id}`);
      }
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io chưa được khởi tạo!");
  }
  return io;
};

module.exports = { initializeSocket, getIO };
