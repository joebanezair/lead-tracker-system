import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    ownerId: mongoose.Schema.Types.ObjectId,
    batchNumber: { type: String, index: true },
    originalFileName: String,
    fileType: String,
    fileSize: Number,
    sheetNames: [String],
    columnMapping: mongoose.Schema.Types.Mixed,
    totalRows: Number,
    processedRows: { type: Number, default: 0 },
    newLeads: { type: Number, default: 0 },
    uniqueEmails: { type: Number, default: 0 },
    duplicateRows: { type: Number, default: 0 },
    invalidRows: { type: Number, default: 0 },
    status: { type: String, default: 'UPLOADED' },
    progress: { type: Number, default: 0 },
    startedAt: Date,
    completedAt: Date
  },
  { timestamps: true }
);

export default mongoose.model('ImportBatch', schema);
