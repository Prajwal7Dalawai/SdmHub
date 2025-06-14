const express = require('express')
const session = require('express-session')
const passport = require('./config/passport')
const authRoutes = require('./routes/auth')
const {connectToDatabase} = require('./models/auth');

const app = express()
const port = 3000

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Session configuration
app.use(session({
    secret: 'your-secret-key', // Change this to a secure secret in production
    resave: false,
    saveUninitialized: false
}))

// Initialize Passport
app.use(passport.initialize())
app.use(passport.session())

// Routes
app.use('/auth', authRoutes)

connectToDatabase().then(() => {
    console.log('Connected to MongoDB')
    app.listen(port, () => console.log(`Server is running on port ${port}!`))
}).catch((err) => {
    console.error('Failed to start server:', err)
})
