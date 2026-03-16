from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional

from ..models.database import get_db
from ..models import models
from ..schemas import schemas
from ..services.nhtsa_service import NHTSAService
from ..services.semantic_search import rank_by_similarity

router = APIRouter()

@router.get("/search", response_model=schemas.Vehicle)
async def search_vehicle(
    vin: Optional[str] = None,
    make: Optional[str] = None,
    model: Optional[str] = None,
    year: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Search by VIN or Make/Model/Year.
    If not in DB, fetches from NHTSA API, saves it, and returns it.
    """
    if vin == "":
        vin = None
        
    if not vin and not (make and model and year):
        raise HTTPException(status_code=400, detail="Must provide VIN or Make, Model, and Year")

    # If VIN provided, decode it first to get make/model/year
    if vin:
        vehicle_data = await NHTSAService.decode_vin(vin)
        if not vehicle_data or not vehicle_data.get("make"):
            raise HTTPException(status_code=404, detail="Vehicle not found for VIN")
        make = vehicle_data["make"]
        model = vehicle_data["model"]
        year = vehicle_data["year"]
    
    make = make.upper()
    model = model.upper()

    # Check DB
    db_vehicle = db.query(models.Vehicle).filter(
        models.Vehicle.make == make,
        models.Vehicle.model == model,
        models.Vehicle.year == year
    ).first()

    if not db_vehicle:
        # Save placeholder to DB
        db_vehicle = models.Vehicle(vin=vin, make=make, model=model, year=year)
        db.add(db_vehicle)
        db.commit()
        db.refresh(db_vehicle)

        # Fetch recalls
        recalls_data = await NHTSAService.get_recalls(make, model, year)
        for r in recalls_data:
            db_recall = models.Recall(**r, vehicle_id=db_vehicle.id)
            db.add(db_recall)

        # Fetch complaints
        complaints_data = await NHTSAService.get_complaints(make, model, year)
        for c in complaints_data:
            # map keys
            c_db = {
                "vin": c.get("vin"),
                "make": make,
                "model": model,
                "year": year,
                "component": c.get("component"),
                "description": c.get("description"),
                "state": c.get("state"),
                "crash": c.get("crash"),
                "fire": c.get("fire"),
                "injury": c.get("injury"),
                "complaint_date": c.get("complaint_date")
            }
            db_complaint = models.Complaint(**c_db, vehicle_id=db_vehicle.id)
            db.add(db_complaint)
        
        db.commit()
        db.refresh(db_vehicle)

    return db_vehicle

@router.get("/vehicle/{vehicle_id}/dashboard", response_model=schemas.DashboardResponse)
def get_dashboard(vehicle_id: int, db: Session = Depends(get_db)):
    vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    # Precompute aggregations
    complaints = db.query(models.Complaint).filter(models.Complaint.vehicle_id == vehicle_id).all()
    
    total_crashes = sum(1 for c in complaints if c.crash)
    total_fires = sum(1 for c in complaints if c.fire)
    total_injuries = sum(1 for c in complaints if c.injury)
    
    # Pattern Analysis
    component_counts = {}
    state_counts = {}
    trend_counts = {}
    trends_by_component = {}

    for c in complaints:
        comp_list = []
        if c.component:
            comp_list = [x.strip() for x in c.component.split(",")]
            for comp in comp_list:
                component_counts[comp] = component_counts.get(comp, 0) + 1
        
        state = c.state or "UNKNOWN"
        if state != "UNKNOWN" and len(state) == 2:
            state_counts[state] = state_counts.get(state, 0) + 1
        
        if c.complaint_date:
            year_str = str(c.complaint_date.year)
            trend_counts[year_str] = trend_counts.get(year_str, 0) + 1
            
            for comp in comp_list:
                if comp not in trends_by_component:
                    trends_by_component[comp] = {}
                trends_by_component[comp][year_str] = trends_by_component[comp].get(year_str, 0) + 1

    # Format responses
    defect_patterns = [{"component": k, "count": v} for k, v in sorted(component_counts.items(), key=lambda item: item[1], reverse=True)[:10]]
    trends = [{"year": k, "count": v} for k, v in sorted(trend_counts.items())]
    
    # Process trends_by_component format
    trends_formatted_by_comp = {}
    for comp, yearly_counts in trends_by_component.items():
        trends_formatted_by_comp[comp] = [{"year": y, "count": c} for y, c in sorted(yearly_counts.items())]
        
    state_dist = [{"state": k, "count": v} for k, v in sorted(state_counts.items(), key=lambda item: item[1], reverse=True)]

    return schemas.DashboardResponse(
        vehicle=vehicle,
        severity=schemas.SeverityIndicators(
            total_crashes=total_crashes,
            total_fires=total_fires,
            total_injuries=total_injuries,
            total_complaints=len(complaints)
        ),
        defect_patterns=defect_patterns,
        trends=trends,
        trends_by_component=trends_formatted_by_comp,
        state_distribution=state_dist
    )

@router.get("/vehicle/{vehicle_id}/complaints", response_model=List[schemas.Complaint])
def get_complaints(
    vehicle_id: int, 
    symptom: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Complaint).filter(models.Complaint.vehicle_id == vehicle_id)
    if symptom:
        query = query.filter(models.Complaint.description.ilike(f"%{symptom}%"))
    return query.order_by(models.Complaint.complaint_date.desc().nulls_last()).all()

@router.get("/vehicle/{vehicle_id}/semantic-search", response_model=List[schemas.Complaint])
def semantic_search_complaints(
    vehicle_id: int,
    symptom: str,
    top_k: int = 50,
    db: Session = Depends(get_db)
):
    """
    Semantically searches complaints for a vehicle using sentence embeddings.
    Finds complaints that are conceptually similar to the symptom query,
    not just exact keyword matches.
    """
    all_complaints = db.query(models.Complaint).filter(
        models.Complaint.vehicle_id == vehicle_id,
        models.Complaint.description != None,
        models.Complaint.description != ""
    ).all()
    
    if not all_complaints:
        return []
    
    # Build (id, description) pairs for ranking
    candidates = [(c.id, c.description) for c in all_complaints if c.description]
    
    # Get ranked complaint IDs by semantic similarity
    ranked_ids = rank_by_similarity(symptom, candidates, top_k=top_k)
    
    # Maintain the ranked order
    id_to_complaint = {c.id: c for c in all_complaints}
    return [id_to_complaint[cid] for cid in ranked_ids if cid in id_to_complaint]

@router.get("/vehicle/{vehicle_id}/recalls", response_model=List[schemas.Recall])
def get_recalls(vehicle_id: int, db: Session = Depends(get_db)):
    return db.query(models.Recall).filter(models.Recall.vehicle_id == vehicle_id).order_by(models.Recall.issue_date.desc().nulls_last()).all()
