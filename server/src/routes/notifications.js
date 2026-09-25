import { Router } from 'express';
import Notification from '../models/Notification.js';
import auth from '../middleware/auth.js';

const router = Router();

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find({ recipientId: req.auth.sub })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json(notifications);
  } catch {
    res.status(500).json({ message: 'Could not load notifications' });
  }
});

router.patch('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientId: req.auth.sub },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(notification);
  } catch {
    res.status(500).json({ message: 'Could not update notification' });
  }
});

router.patch('/read-all', async (req, res) => {
  try {
    await Notification.updateMany(
      { recipientId: req.auth.sub, read: false },
      { read: true }
    );
    res.json({ ok: true });
  } catch {
    res.status(500).json({ message: 'Could not update notifications' });
  }
});

export default router;
