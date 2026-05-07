export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const [{ default: connectDB }, { default: Job }] = await Promise.all([
      import('../../../server/config/db.js'),
      import('../../../server/models/Job.js'),
    ]);

    await connectDB();

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
