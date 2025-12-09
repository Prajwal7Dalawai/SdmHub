const express = require('express')
const session = require('express-session')
const passport = require('passport')
require('dotenv').config();
require('./config/passport')
const authRoutes = require('./routes/auth')
const uploadRoutes = require('./routes/upload')
const postsRoutes = require('./routes/posts')
const { connectToDatabase } = require('./models/auth');
const cors = require('cors');
const friendsRoutes = require('./routes/friends');
const mutualRoutes = require("./routes/recommend");
const NotificationsRoutes = require("./routes/notifications");
const conversationRoutes = require("./routes/conversation.js");
const messageRoutes = require("./routes/message.js");
const http = require("http");
const { Server } = require("socket.io");
const flash = require('connect-flash');
const { initSocket } = require("./socket");

const mutualRoutes = require("./routes/recommend");

// Middleware
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Session configuration
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000
    }
}))
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

// ✅ Share session with WebSockets
io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});


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
app.use("/api/recommend", mutualRoutes); 

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ================= Database + Server Start ===============
connectToDatabase()
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(port, () => console.log(`Server running at ${port}`));
  })
  .catch(err => {
    console.error('Failed to start server:', err);
});

module.exports.io = io;
