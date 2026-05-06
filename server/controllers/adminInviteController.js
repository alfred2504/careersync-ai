import crypto from "crypto";

import AdminInvite from "../models/AdminInvite.js";
import { isSuperAdminEmail, normalizeEmail } from "../config/adminAccess.js";

const INVITE_LIFETIME_MS = 1000 * 60 * 60 * 24 * 7;

const buildInviteLink = (req, token) => {
  const clientUrl = process.env.CLIENT_URL || req.headers.origin || "http://localhost:5173";
  const normalizedBase = clientUrl.replace(/\/$/, "");
  return `${normalizedBase}/register?inviteToken=${encodeURIComponent(token)}`;
};

export const createAdminInvite = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";

    if (!email) {
      return res.status(400).json({ message: "Invite email is required" });
    }

    if (!isSuperAdminEmail(req.user?.email)) {
      return res.status(403).json({ message: "Only Alfred can create admin invites" });
    }

    await AdminInvite.deleteMany({ email, usedAt: null });

    const invite = await AdminInvite.create({
      email,
      name,
      token: crypto.randomBytes(24).toString("hex"),
      createdBy: req.user._id,
      expiresAt: new Date(Date.now() + INVITE_LIFETIME_MS),
    });

    res.status(201).json({
      message: "Admin invite created",
      invite: {
        id: invite._id,
        email: invite.email,
        name: invite.name,
        token: invite.token,
        inviteLink: buildInviteLink(req, invite.token),
        expiresAt: invite.expiresAt,
        usedAt: invite.usedAt,
        createdAt: invite.createdAt,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create admin invite" });
  }
};

export const listAdminInvites = async (req, res) => {
  try {
    if (!isSuperAdminEmail(req.user?.email)) {
      return res.status(403).json({ message: "Only Alfred can view admin invites" });
    }

    const invites = await AdminInvite.find().sort({ createdAt: -1 }).lean();

    res.json({
      invites: invites.map((invite) => ({
        id: invite._id,
        email: invite.email,
        name: invite.name,
        token: invite.token,
        inviteLink: buildInviteLink(req, invite.token),
        expiresAt: invite.expiresAt,
        usedAt: invite.usedAt,
        createdAt: invite.createdAt,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch admin invites" });
  }
};
