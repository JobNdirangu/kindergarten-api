// Import the jsonwebtoken package for token verification
const jwt = require('jsonwebtoken');

// Retrieve the JWT secret from environment variables (ensure it's securely managed)
const JWT_SECRET = process.env.JWT_SECRET;

const  auth = (req, res, next)=> {
    // Extract the Authorization header
    const authHeader = req.headers.authorization;

    // Split the header string into an array using space (' ') as a delimiter.
    // Example: "Bearer abc123xyz" → ["Bearer", "abc123xyz"]
    // We then select index 1 to get the actual token.
    const token = authHeader && authHeader.split(' ')[1];

    // If no token is provided, return a 401 Unauthorized response
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
        // Verify the token using the secret key
        const decoded = jwt.verify(token, JWT_SECRET);

        // Attach the decoded payload (user data) to the request object
        req.user = decoded;

        // Proceed to the next middleware or route handler
        next();
    } catch (err) {
        // If token verification fails, return a 403 Forbidden response
        res.status(403).json({ message: 'Invalid token' });
    }
}

//  Middleware to authorize access based on user role.
//  Accepts any number of allowed roles (e.g. 'admin', 'teacher').
//  Usage: authorizeRoles('admin', 'teacher')
// ...params -accept any number of arguments and automatically puts them into an array.

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: insufficient permissions' });
    }
    next();
  };
};

// Export the auth middleware for use in other parts of the application
module.exports = {auth,authorizeRoles};
