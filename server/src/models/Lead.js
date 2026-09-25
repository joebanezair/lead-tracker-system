import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, index: true },
    lead: {
      firstName: String,
      lastName: String,
      fullName: String,
      email: String,
      phone: String,
      whatsapp: String,
      company: String,
      jobTitle: String,
      website: String,
      linkedin: String,
      industry: String,
      country: String,
      state: String,
      city: String,
      source: String,
      sourceUrl: String,
      verificationStatus: String,
      notes: String
    },
    metadata: {
      normalizedEmail: { type: String, index: true },
      normalizedPhone: String,
      createdBy: mongoose.Schema.Types.ObjectId,
      firstImportBatchId: mongoose.Schema.Types.ObjectId,
      latestImportBatchId: mongoose.Schema.Types.ObjectId,
      firstSeenAt: Date,
      lastSeenAt: Date,
      importCount: { type: Number, default: 1 },
      duplicateCount: { type: Number, default: 0 },
      validationStatus: String,
      tags: [String]
    },
    averageRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

schema.index(
  { ownerId: 1, 'metadata.normalizedEmail': 1 },
  { unique: true, sparse: true }
);

export default mongoose.model('Lead', schema);
