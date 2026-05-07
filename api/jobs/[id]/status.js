export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const [{ default: connectDB }, { default: Job }, jwtModule, { default: User }, adminAccess] = await Promise.all([
      import('../../../server/config/db.js'),
      import('../../../server/models/Job.js'),
      import('jsonwebtoken'),
      import('../../../server/models/User.js'),
      import('../../../server/config/adminAccess.js'),
    ]);

    await connectDB();

    const pathname = (() => {
      try {
        return new URL(req.url, 'http://localhost').pathname;
      } catch {
        return req.url || '';
      }
    })();

    const jobId =
      (typeof req.query?.id === 'string' && req.query.id) ||
      pathname.split('/').filter(Boolean).slice(-2, -1)[0];

    if (!jobId) {
      return res.status(400).json({ message: 'Job ID is required' });
    }

    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwtModule.default.verify(token, process.env.JWT_SECRET || 'supersecret');
    } catch {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user || (user.role !== 'admin' && !adminAccess.isSuperAdminEmail(user.email))) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { status } = req.body;
    const job = await Job.findByIdAndUpdate(jobId, { status }, { new: true });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    return res.status(200).json({ message: 'Job updated', job });
  } catch (error) {
    console.error('Update job status error:', error);
    return res.status(500).json({ message: 'Failed to update job' });
  }
}
