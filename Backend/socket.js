// socket.js
let io = null;

function initSocket(server) {
  const { Server } = require("socket.io");

  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join_conversation", (conversationId) => {
      if (!conversationId) return;
      socket.join(conversationId.toString());
      console.log(`Socket ${socket.id} joined room ${conversationId}`);
    });

    socket.on("send_message", (msg) => {
      console.log("Message received:", msg);
      io.to(msg.conversation_id.toString()).emit("new_message", msg);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
}

module.exports = { initSocket, getIO };
