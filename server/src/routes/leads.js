import { Router } from 'express';
import multer from 'multer';
import XLSX from 'xlsx';
import auth from '../middleware/auth.js';
import Lead from '../models/Lead.js';
import ImportBatch from '../models/ImportBatch.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });
const key = value => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const aliases = {
  firstname:'firstName', lastname:'lastName', fullname:'fullName', name:'fullName',
  email:'email', emailaddress:'email', businessemail:'email', contactemail:'email',
  company:'company', businessname:'company', jobtitle:'jobTitle', title:'jobTitle',
  phone:'phone', mobile:'phone', whatsapp:'whatsapp', website:'website',
  linkedin:'linkedin', industry:'industry', country:'country', state:'state',
  city:'city', source:'source', sourceurl:'sourceUrl',
  verificationstatus:'verificationStatus', notes:'notes'
};

const normalizeRow = row => {
  const lead = {};
  for (const [header, value] of Object.entries(row)) {
    const field = aliases[key(header)];
    if (field) lead[field] = value == null ? '' : String(value).trim();
  }
  if (!lead.fullName) lead.fullName = [lead.firstName, lead.lastName].filter(Boolean).join(' ');
  return lead;
};

router.post('/import', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Choose a spreadsheet to import.' });

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    const batch = await ImportBatch.create({
      ownerId: req.auth.sub,
      batchNumber: 'IMPORT-' + Date.now(),
      originalFileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      sheetNames: workbook.SheetNames,
      totalRows: rows.length,
      status: 'PROCESSING',
      startedAt: new Date()
    });

    let newLeads = 0, duplicates = 0, invalid = 0;
    const seen = new Set();

    for (const row of rows) {
      const lead = normalizeRow(row);
      const email = (lead.email || '').trim().toLowerCase();

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        invalid++;
        continue;
      }
      if (seen.has(email)) {
        duplicates++;
        continue;
      }
      seen.add(email);

      const existing = await Lead.findOne({ ownerId: req.auth.sub, 'metadata.normalizedEmail': email });
      if (existing) {
        duplicates++;
        existing.metadata.importCount = (existing.metadata.importCount || 1) + 1;
        existing.metadata.duplicateCount = (existing.metadata.duplicateCount || 0) + 1;
        existing.metadata.latestImportBatchId = batch._id;
        existing.metadata.lastSeenAt = new Date();
        await existing.save();
        continue;
      }

      await Lead.create({
        ownerId: req.auth.sub,
        lead,
        metadata: {
          normalizedEmail: email,
          createdBy: req.auth.sub,
          firstImportBatchId: batch._id,
          latestImportBatchId: batch._id,
          firstSeenAt: new Date(),
          lastSeenAt: new Date(),
          validationStatus: 'VALID'
        }
      });
      newLeads++;
    }

    batch.processedRows = rows.length;
    batch.newLeads = newLeads;
    batch.uniqueEmails = seen.size;
    batch.duplicateRows = duplicates;
    batch.invalidRows = invalid;
    batch.status = 'COMPLETED';
    batch.progress = 100;
    batch.completedAt = new Date();
    await batch.save();

    res.status(201).json({ batchId: batch.id, totalRows: rows.length, newLeads, duplicates, invalid });
  } catch (error) {
    console.error('Lead import failed:', error);
    res.status(500).json({ message: 'Lead import failed' });
  }
});

router.get('/stats', auth, async (req, res) => {
  try {
    const [total, batches] = await Promise.all([
      Lead.countDocuments({ ownerId: req.auth.sub }),
      ImportBatch.find({ ownerId: req.auth.sub }).sort({ createdAt: -1 }).limit(20)
    ]);
    const duplicates = batches.reduce((sum, batch) => sum + (batch.duplicateRows || 0), 0);
    const invalid = batches.reduce((sum, batch) => sum + (batch.invalidRows || 0), 0);
    res.json({ total, unique: total, duplicates, invalid });
  } catch {
    res.status(500).json({ message: 'Could not load dashboard statistics' });
  }
});

router.get('/', auth, async (req, res) => {
  const leads = await Lead.find({ ownerId: req.auth.sub }).sort({ createdAt: -1 }).limit(100);
  res.json(leads);
});

export default router;
