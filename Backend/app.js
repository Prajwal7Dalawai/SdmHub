const express = require('express')
const session = require('express-session')
const passport = require('passport')
require('./config/passport')
const authRoutes = require('./routes/auth')
const {connectToDatabase} = require('./models/auth');
const cors = require('cors');

const app = express()
const port = 3000

// Middleware
app.use(cors({
    origin: 'http://localhost:5173', // Update this to match your frontend URL
    credentials: true
}));
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Session configuration
app.use(session({
    secret: 'your-secret-key', // Change this to a secure secret in production
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true if using HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
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

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: err.message
    });
});

connectToDatabase().then(() => {
    console.log('Connected to MongoDB')
    app.listen(port, () => console.log(`Server is running on port ${port}!`))
}).catch((err) => {
    console.error('Failed to start server:', err)
})
