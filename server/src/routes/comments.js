import { Router } from 'express';
import Comment from '../models/Comment.js';
import Lead from '../models/Lead.js';
import Notification from '../models/Notification.js';
import auth from '../middleware/auth.js';

export default function createCommentRoutes(io) {
  const router = Router();

  router.use(auth);

  router.post('/', async (req, res) => {
    try {
      const { leadId, content } = req.body;

      if (!leadId || !content?.trim()) {
        return res.status(400).json({ message: 'Lead and comment are required' });
      }

      const lead = await Lead.findById(leadId);

      if (!lead) {
        return res.status(404).json({ message: 'Lead not found' });
      }

      const comment = await Comment.create({
        leadId,
        userId: req.auth.sub,
        content: content.trim()
      });

      await Lead.findByIdAndUpdate(leadId, { $inc: { commentCount: 1 } });

      if (String(lead.ownerId) !== String(req.auth.sub)) {
        const notification = await Notification.create({
          recipientId: lead.ownerId,
          actorId: req.auth.sub,
          type: 'COMMENT',
          leadId,
          commentId: comment._id,
          message: 'Someone commented on one of your leads.'
        });

        io.to('user:' + lead.ownerId).emit('notification:created', notification);
      }

      io.emit('comment:created', comment);
      res.status(201).json(comment);
    } catch {
      res.status(500).json({ message: 'Could not add comment' });
    }
  });

  router.get('/lead/:leadId', async (req, res) => {
    try {
      const comments = await Comment.find({ leadId: req.params.leadId })
        .sort({ createdAt: -1 })
        .lean();
      res.json(comments);
    } catch {
      res.status(500).json({ message: 'Could not load comments' });
    }
  });

  return router;
}
