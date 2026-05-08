export default async function handler(req, res) {
  try {
    const [{ default: connectDB, isDatabaseConnected }, { default: Job }, jwtModule, { default: User }] = await Promise.all([
      import('../../server/config/db.js'),
      import('../../server/models/Job.js'),
      import('jsonwebtoken'),
      import('../../server/models/User.js'),
    ]);

    await connectDB();
    if (!isDatabaseConnected()) {
      return res.status(503).json({ message: 'Database unavailable' });
    }

    if (req.method === 'GET') {
      const { title, location } = req.query;
      const filter = {};

      if (title && typeof title === 'string' && title.trim()) {
        const searchTerm = title.trim();
        filter.$or = [
          { title: { $regex: searchTerm, $options: 'i' } },
          { company: { $regex: searchTerm, $options: 'i' } },
        ];
      }

      if (location && typeof location === 'string' && location.trim()) {
        filter.location = { $regex: location.trim(), $options: 'i' };
      }

      const jobs = await Job.find(filter).sort({ createdAt: -1 });
      return res.status(200).json(jobs);
    }

    if (req.method === 'POST') {
      const authHeader = req.headers.authorization || '';
      if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
      }

      let decoded;
      try {
        decoded = jwtModule.default.verify(authHeader.split(' ')[1], process.env.JWT_SECRET || 'supersecret');
      } catch {
        return res.status(401).json({ message: 'Not authorized' });
      }

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ message: 'Not authorized' });
      }

      const {
        title,
        company,
        location,
        description,
        category,
        employmentType,
        salaryRange,
        experienceLevel,
        tags,
        responsibilities,
        skills,
      } = req.body;

      if (!title || !company || !location || !description) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      const job = await Job.create({
        title,
        company,
        location,
        description,
        category,
        employmentType,
        salaryRange,
        experienceLevel,
        tags,
        responsibilities,
        skills,
        createdBy: user._id,
      });

      return res.status(201).json({ message: 'Job posted successfully', job });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Jobs handler error:', error);
    return res.status(500).json({ message: 'Failed to process jobs request' });
  }
}
