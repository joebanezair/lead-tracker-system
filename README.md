# Lead Tracker System

A full-stack MERN lead management, spreadsheet import, deduplication, metadata, collaboration, and export application designed to handle lead files containing up to **100,000 rows per import**.

## Technology Stack

### Frontend
- React
- Vite
- React Icons
- Socket.IO Client
- Responsive UI with 5px component radius

### Backend
- Node.js
- Express
- MongoDB
- Mongoose
- Socket.IO / WebSockets
- Multer
- XLSX
- JWT
- bcryptjs

## User Roles

### Admin
- Full system access
- Manage users
- View all leads and imports
- Run deduplication operations
- View system-wide analytics
- Manage/moderate comments and ratings
- Export datasets
- Archive/restore records

### User
- Register and log in
- Import lead spreadsheets
- Manage own leads
- Run deduplication
- Search and filter leads
- Add comments and ratings
- View import history
- Export permitted datasets

Lead ownership is scoped by user so one user's private lead database does not automatically collide with another user's records.

## Authentication & Security

- JWT authentication
- Password hashing with bcryptjs
- Protected API routes
- Admin/User authorization
- User-scoped lead ownership
- Refresh/session architecture planned for authenticated sessions

## Dashboard

The dashboard is designed to show:
- Total imported rows
- Total master/unique leads
- Duplicate records
- Invalid records
- Duplicate rate
- Average lead rating
- Recent imports
- Recent comments
- Top-rated leads
- Import activity
- Lead growth
- Realtime processing/activity events

## Spreadsheet Import

Users can import:
- XLSX
- XLS
- CSV

Each import supports up to **100,000 rows**.

### Downloadable Templates

The application supports downloadable:
- XLSX lead template
- CSV lead template

Recommended standard columns:
- First Name
- Last Name
- Email
- Company
- Job Title
- Phone
- WhatsApp
- Website
- LinkedIn
- Industry
- Country
- State
- City
- Source
- Source URL
- Verification Status
- Notes

Email is the primary required field for email-based deduplication. Other fields can remain optional.

## Flexible Column Mapping

Users are not required to use the official template.

The importer is designed to accept spreadsheets with different column names and map them to the internal lead structure.

Examples:

- `Email Address` → Email
- `E-mail` → Email
- `Business Email` → Email
- `Business Name` → Company
- `Mobile` → Phone
- `Contact Person` → Full Name

The workflow supports:
1. Detect spreadsheet headers
2. Automatically suggest mappings
3. Allow the user to change mappings
4. Ignore unnecessary columns
5. Confirm mappings before import

## Import Preview

Before committing a large spreadsheet, the application is designed to preview:
- Filename
- File type
- Row count
- Column count
- Detected mappings
- Ignored fields
- Rows containing emails
- Missing emails
- Invalid email formats

The user confirms the import before the background processing job begins.

## Import Batches

Every upload is tracked as an import batch.

Example:

`IMPORT-20260925-001`

Import metadata includes:
- Owner/user
- Batch number
- Original filename
- File type
- File size
- Worksheet names
- Column mapping
- Total rows
- Processed rows
- New leads
- Unique emails
- Duplicate rows
- Invalid rows
- Progress
- Processing status
- Start time
- Completion time

Supported processing states are designed to include:
- UPLOADED
- VALIDATING
- QUEUED
- PROCESSING
- DEDUPLICATING
- EXPORTING
- COMPLETED
- FAILED

## Large Import Processing

Large spreadsheets should not be processed entirely in the browser.

Architecture:

```text
React
  ↓
Express Upload API
  ↓
Temporary/File Storage
  ↓
Import Batch
  ↓
Job Queue / Background Worker
  ↓
Chunk Processing
  ↓
MongoDB Bulk Operations
```

The target design processes large imports in chunks, for example 1,000–5,000 rows at a time, instead of loading all 100,000 transformed records into memory.

## Realtime Updates / WebSockets

Socket.IO is included on both the frontend and backend.

Realtime updates are intended for:
- Import progress
- Current processing stage
- Rows processed
- New lead counters
- Duplicate counters
- Invalid lead counters
- Import completion
- Import failures
- New leads
- Lead changes
- Comments
- Ratings
- Dashboard statistics
- Activity notifications

A user can leave an import screen while server-side processing continues. Returning clients can retrieve current status and receive subsequent realtime events.

Initial realtime events include:
- `system:ready`
- `import:progress`
- `lead:created`
- `join:import`

## Email Normalization

Emails are normalized before deduplication.

Example:

```text
" JOHN@ABC.COM "
        ↓
trim
        ↓
"JOHN@ABC.COM"
        ↓
lowercase
        ↓
"john@abc.com"
```

Both the original and normalized values can be retained.

## Two-Level Deduplication

### 1. Within-Import Deduplication

The system detects repeated normalized emails inside the currently uploaded spreadsheet.

### 2. Master Database Deduplication

Unique emails from the incoming spreadsheet are also compared with the user's existing master lead database.

This prevents repeated imports from continuously creating new master records for the same email.

## MongoDB Deduplication Protection

The Lead model uses a compound index around:

```text
ownerId + metadata.normalizedEmail
```

This provides user-scoped uniqueness protection at the database level and helps protect against concurrent duplicate inserts.

## Duplicate Preservation

Duplicate rows are not intended to be silently deleted.

A duplicate can:
- Point to its surviving master lead
- Preserve its incoming values
- Preserve the import batch
- Preserve filename
- Preserve worksheet
- Preserve original row number
- Record whether it was duplicated within the file or against the existing database
- Contribute useful missing information to the master record

Example:

```text
Record 1
john@abc.com
ABC Plumbing
Phone: empty

Record 2
JOHN@ABC.COM
ABC Plumbing LLC
Phone: +1 555 123456

Master
john@abc.com
ABC Plumbing LLC
+1 555 123456
```

The source records remain traceable.

## Master Lead Structure

A master lead can contain:

### Lead Information
- First name
- Last name
- Full name
- Email
- Phone
- WhatsApp
- Company
- Job title
- Website
- LinkedIn
- Industry
- Country
- State
- City
- Source
- Source URL
- Verification status
- Notes

### Metadata
- Normalized email
- Normalized phone
- Owner
- Created by
- First import batch
- Latest import batch
- First seen date
- Last seen date
- Import count
- Duplicate count
- Validation status
- Tags

### Collaboration Statistics
- Average rating
- Rating count
- Comment count

## Lead Metadata & Provenance

Metadata is a core feature of the system.

The application is designed to answer:
- Who imported this lead?
- When was it first seen?
- When was it last seen?
- Which import created it?
- Which spreadsheet contained it?
- Which worksheet contained it?
- Which row contained it?
- How many times has it appeared?
- How many duplicates have been detected?
- What was the original email?
- What is the normalized email?
- Were fields merged?
- What source produced the lead?
- What is its validation status?

## Lead Occurrences

Repeated appearances of a master lead can be stored separately as LeadOccurrence records instead of endlessly expanding the master lead document.

A LeadOccurrence can contain:
- Lead ID
- Owner ID
- Import batch ID
- Original filename
- Worksheet
- Original row number
- Original row values
- Normalized email
- Classification
- Timestamp

This provides a complete provenance trail.

## Invalid Leads

Invalid records are preserved instead of silently discarded.

Possible classifications include:
- MISSING_EMAIL
- INVALID_EMAIL_FORMAT
- EMPTY_ROW
- UNSUPPORTED_DATA

Invalid records remain associated with their import batch and original row information.

## Lead Search & Filtering

The Leads page is designed for server-side:
- Search
- Pagination
- Country filtering
- State/city filtering
- Industry filtering
- Rating filtering
- Verification filtering
- Source filtering
- Import batch filtering

The frontend should never need to load an entire 100,000+ lead database simply to render a table.

## Lead Detail/Profile

A lead detail page can provide:
- Contact information
- Company information
- Website
- LinkedIn
- WhatsApp
- Industry
- Location
- Verification status
- Rating
- Comments
- Import history
- Metadata
- Provenance
- Activity history

## Comments

Authenticated users can comment on leads.

Comment records contain:
- Lead ID
- User ID
- Content
- Created timestamp
- Updated timestamp

Users can manage their own comments while administrators can moderate content.

## Ratings

Authenticated users can rate leads from **1–5 stars**.

- 1 star — Poor
- 2 stars — Weak
- 3 stars — Average
- 4 stars — Good
- 5 stars — Excellent

Each user can have only one rating per lead, but the rating can be updated.

MongoDB uses a unique compound index:

```text
leadId + userId
```

The master lead stores aggregate rating information for efficient display.

## Activity / Audit History

Important lead actions can be recorded as activity events.

Planned actions include:
- LEAD_CREATED
- LEAD_IMPORTED
- LEAD_UPDATED
- DUPLICATE_DETECTED
- FIELDS_MERGED
- COMMENT_ADDED
- COMMENT_UPDATED
- RATING_ADDED
- RATING_CHANGED
- LEAD_EXPORTED
- LEAD_ARCHIVED

This creates a traceable lead history.

## Import History

Users can revisit previous imports and inspect:
- Original file
- Import date
- Total rows
- New leads
- Duplicates
- Invalid records
- Processing status
- Processing progress
- Import metadata
- Result datasets

## Export Center

The export system is designed to support:
- Clean/master leads
- Duplicate records
- Invalid records
- Current filtered/search results

Formats:
- XLSX
- CSV

Users can choose whether exports include:
- Lead information
- Source information
- Metadata
- Verification information
- Duplicate statistics
- Ratings
- Comments
- Internal IDs

Example generated filenames:

```text
clean-leads-73814.xlsx
duplicate-leads-22606.xlsx
invalid-leads-3580.xlsx
```

## MongoDB Collections

The planned application data model includes:

```text
users
leads
importBatches
leadOccurrences
duplicateRecords
invalidLeads
comments
ratings
activities
sessions / refreshTokens
```

## API Architecture

Planned REST API:

```text
/api/auth
  POST /register
  POST /login
  POST /refresh
  POST /logout

/api/templates
  GET /xlsx
  GET /csv

/api/imports
  POST /preview
  POST /upload
  GET  /history
  GET  /:id
  GET  /:id/status

/api/leads
  GET    /
  GET    /:id
  POST   /
  PATCH  /:id
  DELETE /:id

/api/dedupe
  POST /run
  GET  /duplicates

/api/comments
  POST   /
  PATCH  /:id
  DELETE /:id

/api/ratings
  POST /
  GET  /lead/:id

/api/activity
  GET /lead/:id

/api/exports
  POST /clean
  POST /duplicates
  POST /invalid
  POST /filtered

/api/dashboard
  GET /stats

/api/admin
  GET   /users
  PATCH /users/:id
```

## End-to-End Workflow

```text
REGISTER / LOGIN
       ↓
DASHBOARD
       ↓
IMPORT LEADS
       ↓
┌──────────────────────┐
│ Download Template    │
│          OR          │
│ Upload XLS/XLSX/CSV  │
└──────────────────────┘
       ↓
READ HEADERS
       ↓
AUTO COLUMN MAPPING
       ↓
USER CONFIRMS
       ↓
IMPORT PREVIEW
       ↓
CREATE IMPORT BATCH
       ↓
QUEUE BACKGROUND JOB
       ↓
PROCESS IN CHUNKS
       ↓
PARSE + VALIDATE + NORMALIZE
       ↓
EMAIL DEDUPLICATION
       ↓
┌───────────────────────┐
│ Within Current Import │
│ Existing Master DB    │
└───────────────────────┘
       ↓
CLASSIFY
       ↓
┌─────────┬───────────┬─────────┐
│ NEW     │ DUPLICATE │ INVALID │
└─────────┴───────────┴─────────┘
       ↓
MASTER LEADS
       ↓
METADATA + PROVENANCE
       ↓
LEAD OCCURRENCES
       ↓
ACTIVITY HISTORY
       ↓
SEARCH / FILTER
       ↓
COMMENTS + RATINGS
       ↓
EXPORT XLSX / CSV
```

Throughout long-running operations, Socket.IO can publish realtime progress to connected clients.

## Current Repository Structure

```text
lead-tracker-system/
├── client/
│   ├── package.json
│   ├── index.html
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       └── styles.css
│
├── server/
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── index.js
│       └── models/
│           ├── Lead.js
│           ├── ImportBatch.js
│           ├── Comment.js
│           └── Rating.js
│
├── package.json
└── README.md
```

## Development Setup

1. Clone the repository.
2. Install root dependencies:
   `npm install`
3. Install client/server dependencies:
   `npm run install:all`
4. Copy `server/.env.example` to `server/.env`.
5. Configure `MONGO_URI`, `JWT_SECRET`, and `CLIENT_URL`.
6. Start MongoDB.
7. Run:
   `npm run dev`

Default development URLs:
- Frontend: `http://localhost:5173`
- API/WebSocket server: `http://localhost:5000`
- Health endpoint: `GET /api/health`

## Development Status

The repository currently contains the initial MERN scaffold, React dashboard, React Icons integration, MongoDB models, and Socket.IO realtime foundation.

The remaining features described above form the implementation roadmap, including production authentication, full spreadsheet ingestion, flexible mapping, background import workers, complete deduplication/provenance processing, comments/ratings APIs, search, exports, and administration.
