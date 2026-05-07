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
    const job = await Job.findById(req.query.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    return res.status(200).json(job);
  } catch (error) {
    console.error('Fetch job error:', error);
    return res.status(500).json({ message: 'Failed to fetch job' });
  }
}
