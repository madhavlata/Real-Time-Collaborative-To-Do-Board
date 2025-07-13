const jwt = require("jsonwebtoken");
module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "No token" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ msg: "Bad token" });
  }
};
// This middleware checks for a valid JWT token in the request headers.
// If the token is valid, it attaches the user information to the request object and calls next to proceed.
// If the token is missing or invalid, it responds with a 401 status and an error message.
// This is useful for protecting routes that require authentication in a Node.js application using Express.
// The JWT_SECRET is used to verify the token's signature, ensuring its authenticity and integrity.
