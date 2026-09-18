# 🌳 Tree Aadhar — Digital Identity System for Fruitfull Jaipur (FFJ)
**Initiative at JECRC Foundation, Jaipur**

Every tree has an Aadhar. Every leaf has a story.

Tree Aadhar transforms anonymous greenery into recognizable, permanent digital identities. Every individual tree planted across the JECRC Foundation campus receives a physical weather-resistant plaque with a unique QR code. Scanning the QR code opens a data-driven botanical identity page displaying species lore, Ayurvedic virtues, growth vitals, caretaker details, and planting heritage.

---

## 🌟 Key Highlights

- **100% Data-Driven**: Driven by MongoDB & React Router dynamic routes (`/tree/:treeId`). No per-tree hardcoded pages.
- **Server-Side Scalability**: Built to support 250+ trees today and thousands tomorrow with server-side pagination, text search, category filtering, and sorting.
- **Permanent Scannable QR Codes**: Server-side high error correction level (`H` for 30% recovery outdoors) encoded with canonical URLs that remain valid forever even as records are updated.
- **Physical ID Card Design**: Designed like an official botanical Aadhar Card / identity certificate with official seal, holographic ribbons, and clear typography.
- **Interactive Campus Map**: Leaflet-powered geotagged map markers centered across JECRC Foundation Jaipur campus.
- **Admin Management Console**:
  - Full CRUD operations with auto-suggested sequential IDs (`FFJ-TREE-XXXX`).
  - **CSV Bulk Onboarding**: Upload hundreds of trees in one click; automatically validates rows and generates QR codes in bulk.
  - **Printable Signage Exporter**: Download all tree QRs in a bulk ZIP archive or export an official multi-tag A4 PDF sheet ready for laminated tree plaques.

---

## 🏗️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, React Router v7, Axios, Lucide Icons, Leaflet / React-Leaflet, Canvas-Confetti.
- **Backend**: Node.js, Express, MongoDB (Mongoose), `qrcode`, `pdfkit`, `archiver`, `csv-parser`, `multer`, `jsonwebtoken`, `bcryptjs`.
- **Database**: Supports MongoDB Atlas / local MongoDB via `MONGODB_URI`, with automatic zero-setup `mongodb-memory-server` fallback.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js v18+ (tested on Node v24)
- npm v10+

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```
*The backend runs on `http://localhost:5000`. It automatically connects to MongoDB (or launches the embedded in-memory database) and seeds 10 authentic botanical trees.*

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*The frontend runs on `http://localhost:5173` with Vite proxy routing `/api` requests to backend.*

---

## 🛡️ Admin Credentials
- **URL**: `http://localhost:5173/admin/login`
- **Username**: `admin`
- **Password**: `ffj@jecrc2025`

---

## 📋 Tree Aadhar Data Model

| Field | Type | Description |
|---|---|---|
| `treeId` | String (Unique) | e.g. `FFJ-TREE-0001` (Auto-incremented) |
| `commonName` | String | e.g. "Mango", "Neem" |
| `scientificName` | String | e.g. "Mangifera indica" |
| `localName` | String | Local Hindi name e.g. "आम (Aam)" |
| `category` | Enum | `'Fruit'`, `'Medicinal'`, `'Ornamental'`, `'Shade'` |
| `photos` | Array[String] | High-resolution Cloudinary URLs |
| `description` | String | Botanical story and characteristics |
| `healthBenefits` | String | Medicinal, nutritional & Ayurvedic uses |
| `culturalSignificance`| String | Religious, festive & cultural folklore |
| `plantedDate` | Date | Date tree was rooted |
| `plantedBy` | String | Sponsor, alumni, or event name |
| `age` | Virtual | Auto-calculated (e.g. "3 yrs 2 mos") |
| `location.zone` | String | Campus zone/block (e.g. "Block A - Central Lawn") |
| `location.latitude` | Number | GPS Latitude |
| `location.longitude`| Number | GPS Longitude |
| `healthStatus` | Enum | `'Healthy'`, `'Needs Attention'`, `'Under Treatment'` |
| `height` / `girth` | Number | Canopy height (m) / Trunk girth (cm) |
| `caretakerName` | String | Campus gardener or club in charge |
| `qrCodeData` | String | Base64 PNG data URL |
| `qrTargetUrl` | String | Permanent URL (`.../tree/:treeId`) |

---

## 📄 API Reference

### Public Endpoints
- `GET /api/trees`: Paginated search & filter (`?page=1&limit=12&search=mango&category=Fruit&zone=...`)
- `GET /api/trees/stats`: Campus-wide analytics & zone distribution
- `GET /api/trees/:treeId`: Single tree by Aadhar ID or MongoDB ID
- `GET /api/trees/template/csv`: Download sample bulk onboarding CSV template
- `GET /api/trees/export/zip`: Download all tree QRs as a compressed ZIP
- `GET /api/trees/export/pdf`: Download print-ready A4 plaque cards PDF

### Admin Protected Endpoints (Bearer Token)
- `POST /api/auth/login`: Authenticate admin
- `GET /api/auth/me`: Verify session
- `POST /api/trees`: Create a tree (auto-assigns ID & generates QR)
- `PUT /api/trees/:treeId`: Update tree records
- `DELETE /api/trees/:treeId`: Delete a tree
- `POST /api/trees/bulk-import`: Multipart CSV upload to onboard 250+ trees

---

## 🎓 Fruitfull Jaipur & JECRC Foundation
Extending environmental stewardship across Jaipur, Rajasthan.
Website: [fruitfull-jaipur.vercel.app](https://fruitfull-jaipur.vercel.app)
