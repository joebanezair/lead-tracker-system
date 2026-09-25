# Lead Tracker System

Full-stack MERN lead management and deduplication application.

## MVP features
- JWT authentication with Admin and User roles
- React dashboard with React Icons
- Downloadable CSV lead template
- Flexible CSV/XLSX import with automatic header mapping
- Up to 100,000 rows per import
- Email normalization and deduplication
- Master leads with metadata/provenance
- Import batches, duplicate records, and invalid lead records
- Lead comments and 1–5 star ratings
- Search, pagination, import history, and CSV export

## Structure
- `client/` React + Vite
- `server/` Node.js + Express + MongoDB

## Run
1. Copy `server/.env.example` to `server/.env`.
2. Run `npm install` in the root.
3. Run `npm run dev`.

MongoDB must be available through `MONGO_URI`.
