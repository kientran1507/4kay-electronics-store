const jwt = require("jsonwebtoken");
const Customer = require("../models/customerModel");
const Admin = require("../models/adminModel");

const getBearerToken = (req) => {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) return "";
  return authorization.slice(7).trim();
};

const protect = async (req, res, next) => {
  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ message: "Authentication token is required." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await Customer.findById(decoded.id).select("-password");
    if (!req.user) {
      return res.status(401).json({ message: "Customer account does not exist." });
    }
    req.authRole = "customer";
    return next();
  } catch {
    return res.status(401).json({ message: "Authentication token is invalid or expired." });
  }
};

const adminProtect = async (req, res, next) => {
  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ message: "Authentication token is required." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Admin access is required." });
    }

    req.user = await Admin.findById(decoded.id).select("-password");
    if (!req.user) {
      return res.status(401).json({ message: "Admin account does not exist." });
    }
    req.authRole = "admin";
    return next();
  } catch {
    return res.status(401).json({ message: "Authentication token is invalid or expired." });
  }
};

const protectCustomerOrAdmin = async (req, res, next) => {
  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ message: "Authentication token is required." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role === "admin") {
      req.user = await Admin.findById(decoded.id).select("-password");
      req.authRole = "admin";
    } else {
      req.user = await Customer.findById(decoded.id).select("-password");
      req.authRole = "customer";
    }
    if (!req.user) {
      return res.status(401).json({ message: "Account does not exist." });
    }
    return next();
  } catch {
    return res.status(401).json({ message: "Authentication token is invalid or expired." });
  }
};

module.exports = { protect, adminProtect, protectCustomerOrAdmin };
