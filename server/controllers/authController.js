import User from "../models/User.js";
import AdminInvite from "../models/AdminInvite.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { isSuperAdminEmail, normalizeEmail } from "../config/adminAccess.js";

const promoteSuperAdmin = async (user) => {
  if (isSuperAdminEmail(user.email) && user.role !== "admin") {
    user.role = "admin";
    await user.save();
  }

  return user;
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role, inviteToken } = req.body;

    // Basic input validation with clear messages
    if (!name || !email || !password) {
      console.warn("Register validation failed - missing fields:", { name, email, password: !!password });
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const normalizedEmail = normalizeEmail(email);

    // check if user exists
    const userExists = await User.findOne({ email: normalizedEmail });

    const isSuperAdmin = isSuperAdminEmail(normalizedEmail);
    let adminInvite = null;

    if (!isSuperAdmin && inviteToken) {
      adminInvite = await AdminInvite.findOne({
        token: inviteToken,
        email: normalizedEmail,
        usedAt: null,
      });

      if (!adminInvite || adminInvite.expiresAt < new Date()) {
        return res.status(403).json({ message: "Invalid or expired admin invite" });
      }
    }

    if (!isSuperAdmin && role === "admin" && !adminInvite) {
      return res.status(403).json({ message: "Admin registration requires an invite" });
    }

    if (userExists) {
      console.warn("Register attempt for existing user:", normalizedEmail);
      if (adminInvite) {
        userExists.role = "admin";

        if (typeof name === "string" && name.trim()) {
          userExists.name = name.trim();
        }

        await userExists.save();

        adminInvite.usedAt = new Date();
        adminInvite.acceptedBy = userExists._id;
        await adminInvite.save();

        const token = jwt.sign(
          { id: userExists._id, email: userExists.email },
          process.env.JWT_SECRET || "supersecret",
          { expiresIn: "7d" }
        );

        return res.status(200).json({
          message: "Admin invite accepted",
          token,
          user: {
            id: userExists._id,
            name: userExists.name,
            email: userExists.email,
            role: userExists.role,
          },
        });
      }

      return res.status(400).json({ message: "User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const userRole = isSuperAdmin || adminInvite ? "admin" : "user";

    // create user
    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: userRole,
    });

    if (adminInvite) {
      adminInvite.usedAt = new Date();
      adminInvite.acceptedBy = user._id;
      await adminInvite.save();
    }

    await promoteSuperAdmin(user);

    // generate token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || "supersecret",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    // validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // find user
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    await promoteSuperAdmin(user);

    // generate token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || "supersecret",
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "Email, new password, and confirmation are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(200).json({
        message: "If an account exists for that email, the password has been updated.",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};