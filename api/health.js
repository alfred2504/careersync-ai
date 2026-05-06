// Simple health endpoint to verify Vercel serverless functions are reachable
export default function handler(req, res) {
  res.status(200).json({ status: "ok", time: new Date().toISOString() });
}
