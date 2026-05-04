import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import express from "express";

import connectDB from "./config/db.js";
import app from "./app.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistDir = path.resolve(__dirname, "..", "client", "dist");
const clientIndexFile = path.join(clientDistDir, "index.html");

// connect DB
connectDB();

if (fs.existsSync(clientDistDir)) {
  app.use(express.static(clientDistDir));

  app.get(/^(?!\/api).*/, (req, res) => {
    if (fs.existsSync(clientIndexFile)) {
      res.sendFile(clientIndexFile);
      return;
    }

    res.status(404).json({ message: "Client build not found" });
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});