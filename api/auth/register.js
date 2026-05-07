export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const [{ default: connectDB }, authController] = await Promise.all([
      import('../../server/config/db.js'),
      import('../../server/controllers/authController.js'),
    ]);

    await connectDB();
    return authController.register(req, res);
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}
