import serverless from "serverless-http";

import app from "../server/app.js";
import connectDB from "../server/config/db.js";

const handler = serverless(app);

export default async function apiHandler(req, res) {
  await connectDB();
  return handler(req, res);
}