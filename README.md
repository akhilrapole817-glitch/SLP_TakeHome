<div align="center">

# 🚗 Vehicle Defect Intelligence

### A legal intelligence tool for automotive defect case evaluation — built for SimpleLegal Partners.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-akhil--slp--mvp.netlify.app-6366f1?style=for-the-badge&logo=netlify)](https://akhil-slp-mvp.netlify.app/)
[![API Docs](https://img.shields.io/badge/API%20Docs-Swagger%20UI-009688?style=for-the-badge&logo=fastapi)](https://slp-backend-8u7k.onrender.com/docs)
[![Backend](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render)](https://slp-backend-8u7k.onrender.com)

</div>

---

## What This Does

Intake coordinators and case attorneys at automotive defect law firms face a daily problem: assessing case viability from raw, scattered NHTSA complaint data is manual and slow. This tool solves that.

Enter a **VIN** or a **Make/Model/Year** and within seconds you get:

- **Case Strength Signal** — a calculated verdict (Strong / Moderate / Limited) based on crash involvement, fire incidents, injuries, and active manufacturer recalls
- **Incident Severity Breakdown** — total complaints, crashes, fires, and injuries in card format
- **Semantic Symptom Search** — search complaints using natural language (e.g. *"engine stalling at highway speeds"*) — the search understands *meaning*, not just keywords
- **Defect Pattern Analysis** — bar chart of the top complaint components (Engine, Brakes, Steering, etc.)
- **Trend Analysis by Component** — line chart showing how complaints for a specific component have changed year-over-year over the last decade
- **Interactive Geographic Map** — a live bubble map showing complaint density by state, color-coded from low (indigo) to critical (red), with clickable popups
- **Manufacturer Recalls Table** — all active NHTSA recalls with campaign numbers, remedy descriptions, and dates
- **Exportable PDF Report** — one-click print-to-PDF that generates a clean, print-formatted report of the full dashboard

---

## Architecture

This is a cleanly decoupled, three-tier architecture:

```
┌─────────────────────┐      ┌──────────────────────┐      ┌─────────────────────┐
│   Next.js Frontend  │ ───▶ │  FastAPI Backend API  │ ───▶ │   NHTSA Public API  │
│  (Netlify)          │      │  (Render)             │      │   (nhtsa.gov)       │
│                     │      │                       │      └─────────────────────┘
│  • React 19         │      │  • Python 3.11        │
│  • Tailwind CSS v4  │      │  • SQLAlchemy ORM     │      ┌─────────────────────┐
│  • Chart.js         │      │  • SQLite (local)     │ ───▶ │   SQLite / Postgres │
│  • Leaflet.js       │      │  • scikit-learn TF-IDF│      │   (Data Cache)      │
└─────────────────────┘      └──────────────────────┘      └─────────────────────┘
```

### Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| **Frontend Framework** | Next.js 16 | App Router, RSC, great DX out of the box |
| **API Layer** | FastAPI | Async-native, auto Swagger docs, Pydantic validation |
| **Database** | SQLite → PostgreSQL | Zero-config local dev; 1-line env var change for prod |
| **Symptom Search** | TF-IDF Cosine Similarity | Beats exact string match with no heavy ML dependencies |
| **Map** | Leaflet.js | Lightweight, open-source, no API key required |
| **Styling** | Tailwind CSS v4 | Utility-first, zero runtime overhead |

---

## Running Locally

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Backend

```bash
cd backend
python -m venv venv

# On Mac/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```

> API is live at **http://localhost:8000**
> Interactive Swagger docs at **http://localhost:8000/docs**

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

> App is live at **http://localhost:3000**

Search for any vehicle — e.g. `2020 Ford F-150` — and the dashboard populates instantly.

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/search` | Search by VIN or Make/Model/Year, fetches and caches NHTSA data |
| `GET` | `/api/vehicle/{id}/dashboard` | Severity, trend, and pattern aggregations |
| `GET` | `/api/vehicle/{id}/complaints` | Keyword-filtered complaints (exact match) |
| `GET` | `/api/vehicle/{id}/semantic-search` | TF-IDF ranked semantic symptom search |
| `GET` | `/api/vehicle/{id}/recalls` | All manufacturer recalls for a vehicle |

Full interactive docs: [slp-backend-8u7k.onrender.com/docs](https://slp-backend-8u7k.onrender.com/docs)

---

## User Stories Covered

| # | Story | Implementation |
|---|---|---|
| 1 | *Intake coordinator enters a VIN to assess case viability* | VIN decode via NHTSA → Case Strength card (Strong/Moderate/Limited) |
| 2 | *Attorney searches complaints by symptom* | TF-IDF semantic search understands meaning, not just keywords |
| 3 | *Attorney sees a geographic map of complaints* | Interactive Leaflet bubble map, color-coded by complaint density |
| 4 | *Senior partner tracks complaint volume trends* | Year-over-year trend chart filterable by defect component |

---

## Tradeoffs & Assumptions

**SQLite vs. PostgreSQL**
Defaulting to SQLite means zero setup friction for a reviewer cloning the repo. The SQLAlchemy ORM is fully PostgreSQL-compatible — switching to Postgres in production is a single `DATABASE_URL` environment variable change.

**First-Search Latency**
The first time a vehicle is searched, the backend makes live calls to the NHTSA API and caches results in the database. All subsequent searches for that vehicle are instant. A production system would pre-warm the cache with background jobs (Celery, etc.).

**TF-IDF vs. Neural Embeddings**
The symptom search uses scikit-learn's TF-IDF vectorizer with bigram support, which already dramatically outperforms naive string matching. A production V2 would use dense vector embeddings (e.g. `all-MiniLM-L6-v2`) stored in `pgvector` for fully semantic recall — but that requires 2GB of GPU dependencies unsuitable for a free-tier server.

**No Cache Invalidation**
Once complaint and recall data is cached to the DB, it doesn't automatically refresh. A production system would add TTL stamps and nightly refresh jobs to keep data current.

---

## Future Extensions

1. **LLM Complaint Summarization** — A "Summarize" button that sends the top 100 complaint descriptions to an LLM and returns a single executive summary paragraph, saving attorneys hours of reading
2. **Vector Semantic Search** — Upgrade from TF-IDF to dense embeddings + pgvector for true semantic recall, allowing queries like *"car feels unsafe in rain"* to surface ABS and traction complaints
3. **Authentication & Multi-Tenancy** — Add Clerk or NextAuth so different law firms can maintain private Case Dockets tied to their account
4. **Asynchronous Data Ingestion** — Celery + Redis background workers to pre-fetch the last 10 model years nightly, eliminating all first-search latency
5. **County-Level Geolocation** — Upgrade the state-level bubble map to a Mapbox cluster map with ZIP/county granularity for manufacturing origin analysis

---

## Tech Stack

**Frontend:** Next.js 16 · React 19 · Tailwind CSS v4 · Chart.js · Leaflet.js · TypeScript

**Backend:** FastAPI · Python 3.11 · SQLAlchemy · Pydantic · scikit-learn · NHTSA Public API

**Infrastructure:** Netlify (Frontend) · Render (Backend) · SQLite (local) / PostgreSQL (prod-ready)

---

<div align="center">
Built for SimpleLegal Partners · View live at <a href="https://akhil-slp-mvp.netlify.app/">akhil-slp-mvp.netlify.app</a>
</div>
