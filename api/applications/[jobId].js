export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const [
      { default: connectDB, isDatabaseConnected },
      authModule,
      JobModel,
      ApplicationModel,
      mongooseModule,
    ] = await Promise.all([
      import('../../server/config/db.js'),
      import('../../server/middleware/authMiddleware.js'),
      import('../../server/models/Job.js'),
      import('../../server/models/Application.js'),
      import('mongoose'),
    ]);

    const mongoose = mongooseModule.default || mongooseModule;

    await connectDB();
    if (!isDatabaseConnected()) {
      return res.status(503).json({ message: 'Database unavailable' });
    }

    const protect = authModule.protect;
    const jobId = req.query.jobId || req.url.split('/applications/')[1];

    return protect(req, res, async () => {
      try {
        if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
          return res.status(400).json({ message: 'Invalid job ID' });
        }

        const job = await JobModel.default.findById(jobId).select('createdBy');

        if (!job) {
          return res.status(404).json({ message: 'Job not found' });
        }

        const isOwner = String(job.createdBy) === String(req.user._id);
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
          return res.status(403).json({
            message: 'You can only view applications for jobs you posted',
          });
        }

        const applications = await ApplicationModel.default.find({
          job: jobId,
        })
          .populate('user', 'name email')
          .sort({ createdAt: -1 });

        return res.json(applications);
      } catch (error) {
        console.error('Fetch applications error:', error);
        return res.status(500).json({ message: 'Failed to fetch applications' });
      }
    });
  } catch (error) {
    console.error('Applications GET handler error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}