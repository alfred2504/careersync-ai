import connectDB from '../../../server/config/db.js';
import Job from '../../../server/models/Job.js';
import jwt from 'jsonwebtoken';
import User from '../../../server/models/User.js';
import { isSuperAdminEmail } from '../../../server/config/adminAccess.js';

async function requireAdmin(req, res) {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No token provided' });
    return null;
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret');
    const user = await User.findById(decoded.id).select('-password');
    if (!user || (user.role !== 'admin' && !isSuperAdminEmail(user.email))) {
      res.status(403).json({ message: 'Admin access required' });
      return null;
    }
    return user;
  } catch (error) {
    res.status(401).json({ message: 'Not authorized' });
    return null;
  }
}

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (error) {
    return res.status(503).json({ message: 'Database unavailable', details: error.message });
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const admin = await requireAdmin(req, res);
  if (!admin) return;

  try {
    const { status } = req.body;
    const job = await Job.findByIdAndUpdate(req.query.id, { status }, { new: true });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    return res.status(200).json({ message: 'Job updated', job });
  } catch (error) {
    console.error('Update job status error:', error);
    return res.status(500).json({ message: 'Failed to update job' });
  }
}
