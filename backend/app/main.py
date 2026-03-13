from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .models.database import engine, Base
from .api.endpoints import router as api_router

# Create DB Schema
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Vehicle Defect Intelligence API",
    description="API for fetching and analyzing NHTSA vehicle defect data.",
    version="1.0.0"
)

# CORS config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # allow frontend (usually http://localhost:3000)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to Vehicle Defect Intelligence API"}
