import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: ['COMMENT'],
      required: true
    },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      index: true
    },
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    },
    message: {
      type: String,
      required: true
    },
    read: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  { timestamps: true }
);

export default mongoose.model('Notification', schema);
