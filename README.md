# Vehicle Defect Intelligence MVP

## Project Overview
The Vehicle Defect Intelligence Tool is an MVP built for SimpleLegal Partners (SLP) to help intake coordinators and case attorneys quickly assess vehicle defect patterns and case strength. By providing a VIN or Make/Model/Year, the tool instantly surfaces pertinent manufacturer recalls, aggregates historical consumer complaints from the NHTSA, and visualizes defect patterns and geographical distributions for deeper analysis.

This tool aims to quickly answer critical questions:
- Is this a known issue?
- Is there a recall?
- How widespread is it?
- Are there safety risks involved (crashes, fires, injuries)?
- Where are complaints originating geographically?

## Features Mapped to User Stories
- **Intake Coordinator (VIN/MMY Lookup):** Instantly search and aggregate existing defect patterns and safety recalls.
- **Case Attorney (Symptom Search):** Filter hundreds of dense complaints instantly by typing symptoms like "transmission slipping" in the data table.
- **Case Attorney (Regional Map):** Identify geographic clusters for manufacturing defects using the State Distribution Bar Chart.
- **Senior Partner (Component Trends):** Analyze complaint volumes over time, with the ability to filter specifically by component (e.g., Engine, Steering) via the Trend Analysis chart dropdown.

## Architecture Explanation
The application is built using a modern decoupled architecture:
- **Frontend Layer**: Next.js (React) application serving as the UI, utilizing Tailwind CSS for structural design and Chart.js for data visualization.
- **Backend API Layer**: FastAPI (Python) web server that handles data retrieval, aggregation, and caching. It sits between the UI and the data sources.
- **Data Layer**: PostgreSQL-compatible schema managed via SQLAlchemy ORM. For MVP simplicity and ease-of-use without complex infrastructure requirements, it defaults to a local SQLite database that accurately tests the ORM implementation.
- **Integration Layer**: A robust Python service module (`nhtsa_service.py`) that handles communication with external public data APIs.

## Tech Stack
**Frontend:**
- Next.js (React Framework)
- Tailwind CSS
- Chart.js (react-chartjs-2)
- Lucide React (Icons)
- Axios

**Backend:**
- Python 3
- FastAPI & Uvicorn (ASGI server)
- SQLAlchemy (ORM)
- Pydantic (Data validation and schema)
- HTTPX (Async HTTP client)
- SQLite (Default DB, easily swappable to PostgreSQL)

## Setup Instructions

### Environment Variables
For demonstration purposes, the application relies on an `.env` file for minimal backend configuration. By default, no keys are strictly required since public NHTSA APIs are used, and a default local SQLite fallback exists.

If using PostgreSQL, create a `backend/.env` file:
```env
DATABASE_URL=postgresql://user:password@localhost/vehicles_db
```

For the frontend, the default API URL is assumed to be `http://localhost:8000/api`. To override, set `NEXT_PUBLIC_API_URL` in `frontend/.env`.

### 1. How to run Backend
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment (optional but recommended):
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload
   ```
   The backend API will be available at [http://127.0.0.1:8000](http://127.0.0.1:8000), and interactive API documentation (Swagger UI) at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

### 2. How to run Frontend
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the necessary NPM dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   The frontend UI will be securely accessible locally at [http://localhost:3000](http://localhost:3000).

## API Data Sources
The MVP integrates seamlessly with the public NHTSA APIs:
- **VIN Decoder API:** `https://vpic.nhtsa.dot.gov/api/}`
- **Recalls API:** `https://api.nhtsa.gov/recalls/recallsByVehicle`
- **Complaints API:** `https://api.nhtsa.gov/complaints/complaintsByVehicle`

## AI Tools Used
During the development of this prototype, **Anthropic Claude 3.5 Sonnet** and the **Gemini Code Assist** tools were leveraged to:
- **FastAPI boilerplate:** Quickly stub out routing structures and SQLAlchemy ORM models.
- **Data Munging:** Parse the complex, inconsistent JSON payload responses from the NHTSA API into structured Postgres/SQLite tables.
- **Tailwind Component Design:** Rapidly synthesize the responsive grid layout, Chart.js integrations, and Lucide React icons into a cohesive, professional UI without spending hours on CSS semantics.

## Tradeoffs and Assumptions
- **Database Engine**: While PostgreSQL was defined for the architecture, SQLite is used out-of-the-box via SQLAlchemy to ensure the project runs locally immediately without forcing reviewers to install/configure a separate Postgres container.
- **Data Freshness (Caching strategy)**: In this MVP, if a Make/Model/Year combination does not exist in the local database, it fetches raw data simultaneously from the NHTSA endpoint and seeds the database. Subsequent requests run directly off the local database. Data invalidation (TTL) is not implemented for the 8-hour MVP scope.
- **Search Capabilities**: Simple SQL `ILIKE` keyword filtering is used for complaint text symptoms. This is lightweight but assumes exact/partial keyword overlap.

## Future Improvements
If an additional week were available, the following improvements would be prioritized:
1. **Semantic Search Integration**: Implement vector embeddings (via OpenAI or local SentenceTransformers) and vector databases (like pgvector) to enable context-aware natural language symptom search (e.g., matching "car shaking" to "steering wheel vibration").
2. **AI Summarization**: Use LLMs to read through hundreds of scattered consumer descriptions and generate a concise 1-paragraph summary of defining structural defects for attorney intake.
3. **Better Mapping & Geolocation**: Upgrade the geographic chart to an interactive Mapbox/Leaflet heatmap showing exact spatial density of defects.
4. **Data Caching & Rate Limiting**: Implement Redis to temporarily cache NHTSA payloads globally, lowering database hits, and implement strict NHTSA API rate limits.
5. **Large Scale Ingestion**: Build asynchronous Celery jobs or Airflow DAGs to pre-emptively load historic defect datasets for all major auto manufacturers spanning 10 years, making the client system instantly responsive without initial loading delays.
