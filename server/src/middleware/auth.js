import jwt from 'jsonwebtoken';

export default function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    req.auth = jwt.verify(
      token,
      process.env.JWT_SECRET || 'development-secret'
    );
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}
