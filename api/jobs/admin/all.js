export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const [{ default: connectDB }, { default: Job }] = await Promise.all([
      import('../../../../server/config/db.js'),
      import('../../../../server/models/Job.js'),
    ]);

    await connectDB();

    const jobs = await Job.find().sort({ createdAt: -1 });
    return res.status(200).json(jobs);
  } catch (error) {
    console.error('Admin fetch jobs error:', error);
    return res.status(500).json({ message: 'Failed to fetch jobs' });
  }
}
