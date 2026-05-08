export default async function handler(req, res) {
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
    const protect = authModule.protect;
    const pathname = (() => {
      try {
        return new URL(req.url, 'http://localhost').pathname;
      } catch {
        return req.url || '';
      }
    })();

    const cleanSegments = (segments) =>
      segments
        .map((segment) => String(segment).split('?')[0].split('#')[0].trim())
        .filter(Boolean);

    const slug = Array.isArray(req.query?.slug)
      ? cleanSegments(req.query.slug)
      : cleanSegments(
          String(req.query?.slug || req.query?.jobId || req.query?.applicationId || '')
            .split('/')
            .filter(Boolean)
        );

    const pathSegments = cleanSegments(pathname.split('/').filter(Boolean));
    const routeIndex = pathSegments.indexOf('applications');
    const requestSegments = slug.length ? slug : routeIndex >= 0 ? pathSegments.slice(routeIndex + 1) : [];

    await connectDB();
    if (!isDatabaseConnected()) {
      return res.status(503).json({ message: 'Database unavailable' });
    }

    if (req.method === 'GET' && requestSegments.length === 1) {
      const jobId = requestSegments[0];

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

          const applications = await ApplicationModel.default.find({ job: jobId })
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

          return res.json(applications);
        } catch (error) {
          console.error('Fetch applications error:', error);
          return res.status(500).json({ message: 'Failed to fetch applications' });
        }
      });
    }

    if (req.method === 'PUT' && requestSegments.length === 2 && requestSegments[1] === 'status') {
      const applicationId = requestSegments[0];

      return protect(req, res, async () => {
        try {
          if (!applicationId || !mongoose.Types.ObjectId.isValid(applicationId)) {
            return res.status(400).json({ message: 'Invalid application ID' });
          }

          const { status } = req.body || {};
          const allowedStatuses = ['accepted', 'rejected'];

          if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid application status' });
          }

          const application = await ApplicationModel.default.findById(applicationId);

          if (!application) {
            return res.status(404).json({ message: 'Application not found' });
          }

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
        } catch (error) {
          console.error('Application status handler error:', error);
          return res.status(500).json({ message: 'Failed to update application' });
        }
      });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Applications catch-all handler error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}