import connectDB from '../../../server/config/db.js';
import Job from '../../../server/models/Job.js';

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
    const jobs = await Job.find().sort({ createdAt: -1 });
    return res.status(200).json(jobs);
  } catch (error) {
    console.error('Admin fetch jobs error:', error);
    return res.status(500).json({ message: 'Failed to fetch jobs' });
  }
}
