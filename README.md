<div align="center">

#  Vehicle Defect Intelligence

### A legal intelligence tool for automotive defect case evaluation — built for Strategic Legal Practices.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-akhil--slp--mvp.netlify.app-6366f1?style=for-the-badge&logo=netlify)](https://akhil-slp-mvp.netlify.app/)
[![API Docs](https://img.shields.io/badge/API%20Docs-Swagger%20UI-009688?style=for-the-badge&logo=fastapi)](https://slp-backend-8u7k.onrender.com/docs)
[![Backend](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render)](https://slp-backend-8u7k.onrender.com)

</div>

---

## What This Does

Intake coordinators and case attorneys at automotive defect law firms face a daily problem: assessing case viability from raw, scattered NHTSA complaint data is manual and slow. This tool solves that.

Enter a **VIN** or a **Make/Model/Year** and within seconds you get:

- **Case Strength Signal** — a rule-based indicator derived from complaint volume, severity markers, and recall presence
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

## AI Tools Used

I used AI sparingly for limited support during development, mainly to speed up a few early scaffolding and wording iterations. All final implementation, integration, logic, and project decisions were completed and reviewed by me.

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

| # | User Story | How the MVP Addresses It |
|---|---|---|
| 1 | As an intake coordinator, I want to enter a VIN and quickly determine whether a vehicle has known issues worth investigating. | The application supports VIN-based lookup, decodes vehicle details, and surfaces recalls, complaint volume, severity indicators, and an overall defect signal summary. |
| 2 | As a case attorney, I want to search complaints by symptom description so I can find similar issues that support a client’s claim. | The complaint search supports similarity-based symptom matching using TF-IDF ranking, helping surface related complaints beyond exact keyword matches. |
| 3 | As a case attorney, I want to see where complaints are coming from so I can identify whether a defect appears regional or widespread. | The dashboard includes an interactive geographic map showing complaint distribution by state, with visual clustering based on relative complaint volume. |
| 4 | As a senior partner, I want to review complaint trends over time for specific vehicles and components so I can identify recurring or emerging defect patterns. | The dashboard includes year-over-year complaint trend analysis and a component-level defect breakdown to highlight recurring patterns over time. |
---

## Acceptance Criteria

The MVP is considered complete if it meets the following criteria:

- A user can search by **VIN** or **Make / Model / Year**
- The system returns relevant **vehicle details**, **NHTSA recalls**, and **consumer complaints**
- The dashboard displays **complaint count**, **severity indicators**, and a **rule-based defect signal**
- The system highlights the **most frequently reported complaint components**
- A user can search complaints by **symptom description**
- The system provides **similarity-based complaint matching** beyond exact keyword filtering
- The dashboard shows **complaint trends over time**
- The dashboard includes **geographic complaint distribution**
- Recall data is displayed in a **structured and easy-to-scan format**
- The application runs locally using the README setup steps
- The hosted demo is accessible through the provided live link

---
## Tradeoffs & Assumptions

**SQLite vs. PostgreSQL**
Defaulting to SQLite means zero setup friction for a reviewer cloning the repo. The SQLAlchemy ORM is fully PostgreSQL-compatible — switching to Postgres in production is a single `DATABASE_URL` environment variable change.

**First-Search Latency**
The first time a vehicle is searched, the backend makes live calls to the NHTSA API and caches results in the database. All subsequent searches for that vehicle are instant. A production system would pre-warm the cache with background jobs (Celery, etc.).

**TF-IDF vs. Neural Embeddings**
The symptom search uses scikit-learn's TF-IDF vectorizer with bigram support, which already dramatically outperforms naive string matching. A production V2 would use dense vector embeddings (e.g. `all-MiniLM-L6-v2`) stored in `pgvector` for fully semantic recall — Dense embedding-based search would improve semantic recall, but it adds additional infrastructure and dependency overhead that felt unnecessary for an 8-hour MVP.

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
Built for Strategic Legal Practices · View live at <a href="https://akhil-slp-mvp.netlify.app/">akhil-slp-mvp.netlify.app</a>
</div>
