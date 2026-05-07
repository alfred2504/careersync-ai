export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const [{ default: connectDB, isDatabaseConnected }, { default: Job }] = await Promise.all([
      import('../../server/config/db.js'),
      import('../../server/models/Job.js'),
    ]);

    await connectDB();
    if (!isDatabaseConnected()) {
      return res.status(503).json({ message: 'Database unavailable' });
    }

    const pathname = (() => {
      try {
        return new URL(req.url, 'http://localhost').pathname;
      } catch {
        return req.url || '';
      }
    })();

    const jobId =
      (typeof req.query?.id === 'string' && req.query.id) ||
      (typeof req.query?.jobId === 'string' && req.query.jobId) ||
      pathname.split('/').filter(Boolean).pop();

    if (!jobId) {
      return res.status(400).json({ message: 'Job ID is required' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    return res.status(200).json(job);
  } catch (error) {
    console.error('Fetch job error:', error);
    return res.status(500).json({ message: 'Failed to fetch job' });
  }
}
