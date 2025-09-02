require("dotenv").config();
const jwt = require('jsonwebtoken');
const AUTH_TOKEN_CODE = process.env.JWT_SECRET
const User = require("../Model/userModel"); // Assuming you have a User model defined


exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  const token = authHeader && authHeader.split(' ')[1];
 
  if (!token) {
    return res.status(401).json({ error: 'Access token not provided' });
  }
  jwt.verify(token, AUTH_TOKEN_CODE, (err, payload) => {

    if (err) {
      console.error("Token verification error:", err);
      return res.status(403).json({ error: 'Invalid or expired access token' });
    }
    // If the token is valid, you can attach the user information to the request object
    User.findById(payload.userId).select('-password')
      .then(user => {
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        } 
        req.user = user; // Attach user to request object
        next(); // Call the next middleware or route handler
      })
      .catch(err => {
        console.error("Error fetching user:", err);
        return res.status(500).json({ error: 'Internal server error' });
      });
  });
}

