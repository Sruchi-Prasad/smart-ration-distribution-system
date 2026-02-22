const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  console.log("Auth header received:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.ACCESS_SECRET);
    console.log("Decoded payload:", payload);
    req.user = { sub: payload.sub, role: payload.role,email: payload.email };
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      console.error("❌ Access token expired at:", err.expiredAt);
      return res.status(401).json({ error: "Access token expired" });
    }
    console.error("❌ JWT verification failed:", err.message);
    return res.status(401).json({ error: "Token verification failed" });
  }

}

function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admins only" });
  }
  next();
}

function authenticate(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
}

function requireShopkeeper(req, res, next) {
  if (req.user.role !== "shopkeeper") {
    return res.status(403).json({ message: "Access denied: shopkeepers only" });
  }
  next();
}

function requireUser(req, res, next) {
  if (req.user?.role !== "user") {
    return res.status(403).json({ error: "Forbidden: Users only" });
  }
  next();
}

module.exports = {
  requireAuth,
  requireAdmin,
  requireShopkeeper,
  requireUser,
  authenticate
};
