import { Router } from 'express';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = Router();
router.use(auth);

const profileResponse = user => ({
  id: user.id,
  name: user.name,
  email: user.email,
  avatar: user.avatar || '',
  coverPhoto: user.coverPhoto || '',
  bio: user.bio || '',
  occupation: user.occupation || '',
  avatarPositionX: user.avatarPositionX ?? 50,
  avatarPositionY: user.avatarPositionY ?? 50,
  role: user.role
});

router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.auth.sub);
    if (!user) return res.status(404).json({ message: 'Profile not found' });
    res.json(profileResponse(user));
  } catch {
    res.status(500).json({ message: 'Could not load profile' });
  }
});

router.patch('/', async (req, res) => {
  try {
    const user = await User.findById(req.auth.sub);
    if (!user) return res.status(404).json({ message: 'Profile not found' });

    const { name, bio, occupation, avatar, coverPhoto, avatarPositionX, avatarPositionY } = req.body;

    if (typeof name === 'string' && name.trim()) user.name = name.trim();
    if (typeof bio === 'string') user.bio = bio.slice(0, 500);
    if (typeof occupation === 'string') user.occupation = occupation.trim().slice(0, 120);
    if (typeof avatar === 'string') user.avatar = avatar;
    if (typeof coverPhoto === 'string') user.coverPhoto = coverPhoto;
    if (Number.isFinite(avatarPositionX)) user.avatarPositionX = Math.max(0, Math.min(100, avatarPositionX));
    if (Number.isFinite(avatarPositionY)) user.avatarPositionY = Math.max(0, Math.min(100, avatarPositionY));

    await user.save();
    res.json(profileResponse(user));
  } catch {
    res.status(500).json({ message: 'Could not save profile' });
  }
});

export default router;
