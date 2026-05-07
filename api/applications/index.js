export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const [
        { default: connectDB, isDatabaseConnected },
        authModule,
        ApplicationModel,
      ] = await Promise.all([
        import('../../server/config/db.js'),
        import('../../server/middleware/authMiddleware.js'),
        import('../../server/models/Application.js'),
      ]);

      await connectDB();
      if (!isDatabaseConnected()) {
        return res.status(503).json({ message: 'Database unavailable' });
      }

      const protect = authModule.protect;

      return protect(req, res, async () => {
        try {
          const { jobId, coverLetter } = req.body;

          if (!jobId) {
            return res.status(400).json({ message: 'Job ID is required' });
          }

          const existing = await ApplicationModel.default.findOne({
            job: jobId,
            user: req.user._id,
          });

          const applicationData = {
            job: jobId,
            user: req.user._id,
            coverLetter: coverLetter || null,
            cvUrl: null, // Serverless: CVs not persisted
            cvOriginalName: null,
          };

          const application = existing
            ? await ApplicationModel.default.findByIdAndUpdate(existing._id, applicationData, {
                new: true,
                runValidators: true,
              })
            : await ApplicationModel.default.create(applicationData);

          return res.status(201).json({
            message: existing ? 'Application updated successfully' : 'Application submitted successfully',
            application,
          });
        } catch (error) {
          console.error('Apply error:', error);
          return res.status(500).json({ message: 'Failed to apply' });
        }
      });
    } catch (error) {
      console.error('Applications handler error:', error);
      return res.status(500).json({ message: error.message || 'Internal server error' });
    }
  }

  if (req.method === 'GET') {
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

      return protect(req, res, async () => {
        try {
          const jobId = req.url.split('/applications/')[1];

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
      console.error('Applications handler error:', error);
      return res.status(500).json({ message: error.message || 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

