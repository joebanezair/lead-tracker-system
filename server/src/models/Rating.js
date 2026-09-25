import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    rating: { type: Number, min: 1, max: 5, required: true }
  },
  { timestamps: true }
);

schema.index({ leadId: 1, userId: 1 }, { unique: true });

export default mongoose.model('Rating', schema);
