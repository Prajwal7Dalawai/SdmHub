const express = require('express')
const session = require('express-session')
const passport = require('passport')
require('dotenv').config();
require('./config/passport')
const authRoutes = require('./routes/auth')
const uploadRoutes = require('./routes/upload')
const postsRoutes = require('./routes/posts')
const {connectToDatabase} = require('./models/auth');
const cors = require('cors');
const friendsRoutes = require('./routes/friends');
const conversationRoutes = require("./routes/conversation.js");
const messageRoutes = require("./routes/message.js");
const http = require("http");
const { Server } = require("socket.io");

const app = express();  // ✅ DEFINE APP FIRST
const port = 3000;

// ================= Socket.io Setup =================
const server = http.createServer(app); // ✅ Now app exists

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id);

  socket.on("join_conversation", (conversationId) => {
    socket.join(conversationId);
    console.log("Joined:", conversationId);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});


// Middleware
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/auth', authRoutes);
app.use('/upload', uploadRoutes);
app.use('/posts', postsRoutes);
app.use('/api/users', require('./routes/user'));
app.use('/api/friends', friendsRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);

// Error Handler
app.use((err, req, res, next) => {
    console.error("Error:", err);
    res.status(500).json({ success: false, message: 'Internal server error' });
});


// ================= Database + Server Start ===============
connectToDatabase()
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(port, () => console.log(`Server running at ${port}`)); // ✅ Use server not app
  })
  .catch(err => {
    console.error('Failed to start server:', err);
});

module.exports.io = io;