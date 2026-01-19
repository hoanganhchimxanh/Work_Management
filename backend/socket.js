const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000",
      credentials: true,
    },
  });

  // Middleware xác thực - chỉ verify token, KHÔNG join room ở đây
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        console.log("❌ No token provided");
        return next(new Error("Unauthorized"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;

      console.log(`✅ Socket authenticated for user: ${decoded.userId}`);
      next();
    } catch (err) {
      console.error("❌ Socket auth error:", err.message);
      next(new Error("Unauthorized"));
    }
  });

  // Join room SAU KHI socket đã connected
  io.on("connection", (socket) => {
    const roomId = socket.userId.toString();

    // Join user vào room riêng của họ
    socket.join(roomId);

    console.log(`🔔 Socket connected: ${socket.id}`);
    console.log(`👤 User ID: ${socket.userId}`);
    console.log(`🏠 Joined room: ${roomId}`);

    // Debug: Kiểm tra số lượng socket trong room
    io.in(roomId).allSockets().then(sockets => {
      console.log(`📊 Total sockets in room ${roomId}: ${sockets.size}`);
    });

    socket.on("disconnect", () => {
      console.log(`❌ Socket disconnected: ${socket.id}, User: ${socket.userId}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

module.exports = {
  initSocket,
  getIO,
};