import { isDatabaseConnected } from "../config/db.js";

export const requireDatabase = (req, res, next) => {
  if (isDatabaseConnected()) {
    return next();
  }

  return res.status(503).json({
    message:
      "Database unavailable. Check your MongoDB Atlas IP whitelist or MONGODB_URI.",
  });
};
