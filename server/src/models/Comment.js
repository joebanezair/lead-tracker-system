import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, index: true },
    content: { type: String, required: true, trim: true, maxlength: 4000 }
  },
  { timestamps: true }
);

export default mongoose.model('Comment', schema);
