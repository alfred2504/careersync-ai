export default async function handler(req, res) {
  try {
    const [
      { default: connectDB, isDatabaseConnected },
      authModule,
      ApplicationModel,
      JobModel,
      multerModule,
      mongooseModule,
    ] = await Promise.all([
      import('../../server/config/db.js'),
      import('../../server/middleware/authMiddleware.js'),
      import('../../server/models/Application.js'),
      import('../../server/models/Job.js'),
      import('multer'),
      import('mongoose'),
    ]);

    const mongoose = mongooseModule.default || mongooseModule;
    const multer = multerModule.default || multerModule;
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
    const pathSegments = cleanSegments(pathname.split('/').filter(Boolean));
    const routeIndex = pathSegments.indexOf('applications');
    const requestSegments = routeIndex >= 0 ? pathSegments.slice(routeIndex + 1) : [];

    await connectDB();
    if (!isDatabaseConnected()) {
      return res.status(503).json({ message: 'Database unavailable' });
    }

    if (req.method === 'POST') {
      const upload = multer({
        storage: multer.memoryStorage(),
        limits: {
          fileSize: 5 * 1024 * 1024,
        },
      });

      return protect(req, res, () => {
        upload.single('cv')(req, res, async (uploadError) => {
          if (uploadError) {
            return res.status(400).json({ message: uploadError.message });
          }

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
              cvUrl: existing?.cvUrl || null,
              cvOriginalName: req.file?.originalname || existing?.cvOriginalName || null,
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
      });
    }

    if (req.method === 'GET') {
      return protect(req, res, async () => {
        try {
          const jobId = requestSegments[0];

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
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Applications handler error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}

