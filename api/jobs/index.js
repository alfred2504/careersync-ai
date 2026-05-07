import connectDB from '../../server/config/db.js';
import Job from '../../server/models/Job.js';

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (error) {
    return res.status(503).json({ message: 'Database unavailable', details: error.message });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
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
  } catch (error) {
    console.error('Fetch jobs error:', error);
    return res.status(500).json({ message: 'Failed to fetch jobs' });
  }
}
