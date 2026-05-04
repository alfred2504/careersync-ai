import express from "express";

import { protect } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";
import { createAdminInvite, listAdminInvites } from "../controllers/adminInviteController.js";

const router = express.Router();

router.get("/invites", protect, isAdmin, listAdminInvites);
router.post("/invites", protect, isAdmin, createAdminInvite);

export default router;
