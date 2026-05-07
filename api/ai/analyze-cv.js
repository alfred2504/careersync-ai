export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const [{ default: connectDB, isDatabaseConnected }, aiModule] = await Promise.all([
      import('../../server/config/db.js'),
      import('../../server/controllers/aiController.js'),
    ]);

    await connectDB();
    if (!isDatabaseConnected()) {
      return res.status(503).json({ message: 'Database unavailable' });
    }

    return aiModule.analyzeCV(req, res);
  } catch (error) {
    console.error('Analyze CV error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}
