export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const [
      { default: connectDB, isDatabaseConnected },
      authModule,
      JobModel,
      ApplicationModel,
      multerModule,
      pathModule,
      fsModule,
    ] = await Promise.all([
      import('../../server/config/db.js'),
      import('../../server/middleware/authMiddleware.js'),
      import('../../server/models/Job.js'),
      import('../../server/models/Application.js'),
      import('multer'),
      import('path'),
      import('fs'),
    ]);

    const multer = multerModule.default || multerModule;
    const path = pathModule.default || pathModule;
    const fs = fsModule.default || fsModule;

    await connectDB();
    if (!isDatabaseConnected()) {
      return res.status(503).json({ message: 'Database unavailable' });
    }

    // Use protect middleware from authModule
    const protect = authModule.protect;

    // Ensure uploads directory exists
    const uploadsDir = path.resolve('uploads');
    try {
      fs.mkdirSync(uploadsDir, { recursive: true });
    } catch (err) {
      console.warn('Failed to ensure uploads directory:', err);
    }

    const storage = multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, uploadsDir),
      filename: (_req, file, cb) => {
        const safeOriginalName = path.basename(file.originalname).replace(/\s+/g, '_');
        cb(null, `${Date.now()}-${safeOriginalName}`);
      },
    });

    const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

    // Run auth protect, then multer, then application logic
    return protect(req, res, () => {
      upload.single('cv')(req, res, async (uploadErr) => {
        if (uploadErr) {
          return res.status(400).json({ message: uploadErr.message });
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
            coverLetter,
            cvUrl: req.file ? `${req.protocol}://${req.headers.host}/uploads/${req.file.filename}` : existing?.cvUrl,
            cvOriginalName: req.file?.originalname || existing?.cvOriginalName,
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
  } catch (error) {
    console.error('Applications handler error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}
