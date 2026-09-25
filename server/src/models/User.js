import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    passwordHash: String,
    googleId: { type: String, sparse: true, index: true },
    avatar: String,
    coverPhoto: String,
    bio: { type: String, trim: true, maxlength: 500 },
    avatarPositionX: { type: Number, min: 0, max: 100, default: 50 },
    avatarPositionY: { type: Number, min: 0, max: 100, default: 50 },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    status: { type: String, enum: ['active', 'paused', 'disabled'], default: 'active' },
    lastLoginAt: Date
  },
  { timestamps: true }
);

export default mongoose.model('User', schema);
