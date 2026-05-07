export default async function handler(req, res) {
  try {
    const [
      { default: connectDB, isDatabaseConnected },
      authModule,
      ApplicationModel,
      mongooseModule,
    ] = await Promise.all([
      import('../../server/config/db.js'),
      import('../../server/middleware/authMiddleware.js'),
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
        const applicationId = req.url.split('/applications/')[1]?.split('/')[0];

        if (!applicationId || !mongoose.Types.ObjectId.isValid(applicationId)) {
          return res.status(400).json({ message: 'Invalid application ID' });
        }

        if (req.method === 'PUT') {
          const { status } = req.body || {};
          const allowedStatuses = ['accepted', 'rejected'];

          if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid application status' });
          }

          const application = await ApplicationModel.default.findById(applicationId);

          if (!application) {
            return res.status(404).json({ message: 'Application not found' });
          }

          // Check if user is the job poster or admin
          const [{ default: JobModel }] = await Promise.all([
            import('../../server/models/Job.js'),
          ]);

          const job = await JobModel.default.findById(application.job).select('createdBy');

          if (!job) {
            return res.status(404).json({ message: 'Job not found' });
          }

          const isOwner = String(job.createdBy) === String(req.user._id);
          const isAdmin = req.user.role === 'admin';

          if (!isOwner && !isAdmin) {
            return res.status(403).json({
              message: 'You can only update applications for jobs you posted',
            });
          }

          application.status = status;
          await application.save();

          const updatedApplication = await ApplicationModel.default.findById(application._id).populate(
            'user',
            'name email'
          );

          return res.json({
            message: `Application ${status}`,
            application: updatedApplication,
          });
        }

        return res.status(405).json({ message: 'Method not allowed' });
      } catch (error) {
        console.error('Application status handler error:', error);
        return res.status(500).json({ message: 'Failed to update application' });
      }
    });
  } catch (error) {
    console.error('Applications status handler error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}
