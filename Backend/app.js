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

const app = express()
const port = 3000

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

// Initialize Passport
app.use(passport.initialize())
app.use(passport.session())

// Debug middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, {
        body: req.body,
        session: req.session,
        cookies: req.cookies
    });
    next();
});

// Routes
app.use('/auth', authRoutes)
app.use('/upload', uploadRoutes)
app.use('/posts', postsRoutes)
app.use('/api/users', require('./routes/users'));
app.use('/api/friends', friendsRoutes);
app.use("/api/recommend", mutualRoutes);

// ⭐ ADD THIS
app.use("/api/notifications", NotificationsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    if (err && err.stack) {
        console.error('Stack:', err.stack);
    }
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: err.message,
        stack: err.stack
    });
});

connectToDatabase().then(() => {
    console.log('Connected to MongoDB')
    app.listen(port, () => console.log(`Server is running on port ${port}!`))
}).catch((err) => {
    console.error('Failed to start server:', err)
})
