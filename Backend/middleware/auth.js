// Middleware to check if user is authenticated
function ensureAuthenticated(req, res, next) {
    // Passport adds isAuthenticated() method to req
    if (req.isAuthenticated && req.isAuthenticated()) {
        return next(); // User is authenticated, proceed
    }

    // If not authenticated, return 401 Unauthorized
    res.status(401).json({ success: false, message: "Unauthorized" });
}

// Optionally, middleware to check for roles (e.g., admin)
function ensureRole(role) {
    return (req, res, next) => {
        if (req.isAuthenticated && req.isAuthenticated()) {
            if (req.user.role === role) return next();
        }
        res.status(403).json({ success: false, message: "Forbidden: Access denied" });
    };
}

module.exports = {
    ensureAuthenticated,
    ensureRole
};
