const jwt = require("jsonwebtoken");
const { env } = require("../utils/env");
const { User } = require("../models/User");

function signToken(user) {
  return jwt.sign({ sub: String(user._id), role: user.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const headerToken = header.startsWith("Bearer ") ? header.slice(7) : null;
    const cookieToken = req.cookies?.token || null;
    const token = headerToken || cookieToken;
    if (!token) return res.status(401).json({ message: "Missing token" });

    const payload = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) return res.status(401).json({ message: "Invalid token" });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: "Forbidden" });
    next();
  };
}

module.exports = { signToken, requireAuth, requireRole };

