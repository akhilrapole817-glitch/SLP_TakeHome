# 🚗 Vehicle Defect Intelligence MVP

Hey there! 👋 Welcome to the **Vehicle Defect Intelligence Tool**, an MVP built for SimpleLegal Partners (SLP). 

I built this prototype to help legal teams (like Intake Coordinators and Case Attorneys) instantly assess the viability of automotive defect cases. Instead of trawling through scattered NHTSA databases, this tool takes a VIN or Make/Model/Year and instantly surfaces live recall data, visualizes historical complaint trends, and plots geographic defect clusters. 

Whether an attorney needs to know if a specific "transmission slipping" issue is widespread, or a partner wants to see a 10-year trend analysis for engine fires, this tool puts the data directly in front of them in seconds.

---

## 🏗️ Architecture Design

I went with a decoupled, modern web architecture for this MVP to ensure it's fast, scalable, and easy to iterate on.

1.  **Frontend (Next.js + Tailwind + Chart.js)**
    *   **Why Next.js?** It gives us a robust React framework with great routing out of the box. 
    *   I used **Tailwind CSS** for rapid, clean styling without the bloat of heavy component libraries, and **Chart.js** to render our dynamic severity and distribution visualizations.
2.  **Backend API (FastAPI + Python)**
    *   **Why FastAPI?** It's incredibly fast, handles async requests beautifully (which we need when hitting external APIs), and self-documents via Swagger. It acts as the orchestration layer between the frontend and our data.
3.  **Data Layer (SQLAlchemy + SQLite/PostgreSQL)**
    *   I used **SQLAlchemy** as the ORM. The schema is fully PostgreSQL-compatible, but for the sake of making this MVP *effortless* for you to run locally right now, it defaults to a local **SQLite** database. No Docker containers or local Postgres installations are required to test this out!
4.  **External Integrations**
    *   The backend reaches out to the **NHTSA Public API** (VIN decoding, Recalls, and Complaints) to fetch and cache live automotive data.

---

## 🛠️ Setup & Running Locally

Because I configured the backend to use SQLite by default, getting this running on your machine is a breeze.

### 1. Start the Backend API
Pop open a terminal and run the following:
```bash
cd backend
python3 -m venv venv           # Create a virtual environment
source venv/bin/activate       # Activate it (on Windows: venv\\Scripts\\activate)
pip install -r requirements.txt # Install dependencies
uvicorn app.main:app --reload   # Start the server
```
*The API will be live at `http://localhost:8000`. You can view the auto-generated documentation at `http://localhost:8000/docs`.*

### 2. Start the Frontend App
Open a *second* terminal window:
```bash
cd frontend
npm install   # Install node modules
npm run dev   # Start the Next.js dev server
```
*The UI will be running at `http://localhost:3000`. Head there in your browser, type in a car (e.g., "2021 Honda Accord"), and hit search!*

---

## 🤖 AI Tools Used

I leveraged AI to accelerate the boilerplate and data munging phases of this MVP, acting as an advanced pair-programmer:

*   **Anthropic Claude 3.5 Sonnet & Gemini**: Used primarily for structuring the initial Next.js layout and FastAPI routing syntax. When integrating the NHTSA APIs, the JSON payloads can be deeply nested and inconsistent; I used AI to help write the Python parsing logic that flattens this data clearly into our Pydantic schemas. 
*   **Tailwind / UI Generation**: Instead of manually writing flexbox containers and padding for every dashboard card, I used AI to quickly generate the responsive `grid` layouts and Chart.js wrapper components, allowing me to focus on the actual business logic and data flow.

---

## ⚖️ Tradeoffs & Assumptions

When building a 48-hour MVP, you have to draw lines in the sand. Here are my structural tradeoffs:

1.  **SQLite vs. PostgreSQL**: As mentioned, the architecture is designed for Postgres, but I shipped it with SQLite. *Assumption*: Reviewers want a frictionless friction tool that runs instantly on `git clone`. For production, this is a 1-line environment variable change to point to a managed Postgres DB.
2.  **Caching Strategy (or lack thereof)**: Right now, if you search for a car, the backend fetches the data from the NHTSA and stores it in the DB. Future identical searches load instantly from the DB. *Tradeoff*: I did not implement a Time-To-Live (TTL) or cache invalidation strategy for this MVP. Over time, recall data changes, so a production app would need background jobs to refresh stale database rows.
3.  **Basic Keyword Search**: The symptom search in the Complaints table uses basic string matching (`ILIKE`). It works well enough for an MVP, but it lacks semantic understanding (e.g., searching "engine fire" won't automatically find "combustion under hood").

---

## 🚀 Future Extensions (With Another Week)

If I had another week to take this from MVP to a production-ready V1, here is exactly what I would build:

1.  **AI Semantic Search (RAG)**: Attorneys don't always know the exact keywords consumers use. I would pipe the complaints through an embedding model (like OpenAI or local HuggingFace models) and store them in `pgvector`. This would allow attorneys to search naturally, like *"Does the car shake violently at high speeds?"* and surface matches regardless of exact phrasing.
2.  **LLM Complaint Summarization**: Intake coordinators waste time reading 500 disjointed complaints. I would add a button that passes the raw complaint text to an LLM to generate a single "Executive Summary" paragraph of the vehicle's structural flaws.
3.  **Asynchronous Data Ingestion**: Relying on user-searches to populate the database is sluggish for the first user. I would write Celery background tasks or Airflow DAGs to pre-fetch the last 10 years of vehicle data from the NHTSA overnight, meaning our app is always instant.
4.  **Advanced Geolocation (Mapbox)**: The current choropleth map is great, but upgrading to an interactive Mapbox/Leaflet cluster map would let attorneys zoom into specific counties or ZIP codes to find hyper-local defect clusters.
5.  **Authentication & Multi-Tenant**: Add NextAuth (or Clerk) and tie User/Organization IDs to database rows so different law firms can save specific vehicles to their private "Case Dockets."
