export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const [
      { default: connectDB, isDatabaseConnected },
      authModule,
      ApplicationModel,
      multerModule,
    ] = await Promise.all([
      import('../../server/config/db.js'),
      import('../../server/middleware/authMiddleware.js'),
      import('../../server/models/Application.js'),
      import('multer'),
    ]);

    const multer = multerModule.default || multerModule;

    await connectDB();
    if (!isDatabaseConnected()) {
      return res.status(503).json({ message: 'Database unavailable' });
    }

    // Use protect middleware from authModule
    const protect = authModule.protect;

    // Use memory storage for serverless environments (avoid writing to read-only filesystem)
    const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

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
            cvUrl: null, // Serverless: not persisting uploaded file to disk
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
