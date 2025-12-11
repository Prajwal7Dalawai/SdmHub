const express = require('express');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();
require('./config/passport');

const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const postsRoutes = require('./routes/posts');
const { connectToDatabase } = require('./models/auth');
const cors = require('cors');
const friendsRoutes = require('./routes/friends');
const conversationRoutes = require("./routes/conversation.js");
const messageRoutes = require("./routes/message.js");

const http = require("http");
const { Server } = require("socket.io"); // (still fine if socket.js uses it)
const flash = require('connect-flash');
const { initSocket } = require("./socket");

const notificationRoutes = require("./routes/notification");
const mutualRoutes = require("./routes/recommend");

const app = express();
const port = 3000;

// ✅ Create one shared session middleware
const sessionMiddleware = session({
  secret: 'something',
  resave: false,
  saveUninitialized: false
});

app.use(sessionMiddleware);

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Flash after session
app.use(flash());

// ================= Socket.io Setup =================
const server = http.createServer(app);
const io = initSocket(server);

// ✅ ✅ ✅ VERY IMPORTANT FOR REAL-TIME NOTIFICATIONS
global.io = io;

// ✅ Share session with WebSockets
io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});

// ================= CORS + BODY PARSING =================
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= ROUTES =================
app.use('/auth', authRoutes);
app.use('/upload', uploadRoutes);
app.use('/posts', postsRoutes);
app.use('/api/users', require('./routes/user'));
app.use('/api/friends', friendsRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);
app.use("/api/recommend", mutualRoutes); 
app.use('/api/notifications', notificationRoutes);

// ================= ERROR HANDLING =================
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ================= DATABASE + SERVER START =================
connectToDatabase()
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(port, () => console.log(`✅ Server running at ${port}`));
  })
  .catch(err => {
    console.error('❌ Failed to start server:', err);
  });

// Export io if needed elsewhere
module.exports.io = io;
