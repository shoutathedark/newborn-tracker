const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email }
    next();
  } catch {
    return res.status(403).json({ message: "Invalid token" });
  }
}

module.exports = auth;