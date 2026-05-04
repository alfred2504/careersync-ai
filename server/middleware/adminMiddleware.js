import { isSuperAdminEmail } from "../config/adminAccess.js";

export const isAdmin = async (req, res, next) => {
  try {
    if (req.user?.role !== "admin" && !isSuperAdminEmail(req.user?.email)) {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: "Authorization error" });
  }
};