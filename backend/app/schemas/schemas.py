from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date, datetime

class RecallBase(BaseModel):
    nhtsa_campaign_number: Optional[str] = None
    component: Optional[str] = None
    description: Optional[str] = None
    consequence: Optional[str] = None
    remedy: Optional[str] = None
    manufacturer: Optional[str] = None
    issue_date: Optional[date] = None

class RecallCreate(RecallBase):
    pass

class Recall(RecallBase):
    id: int
    vehicle_id: int
    created_at: datetime
    class Config:
        from_attributes = True

class ComplaintBase(BaseModel):
    vin: Optional[str] = None
    make: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    component: Optional[str] = None
    description: Optional[str] = None
    state: Optional[str] = None
    crash: bool = False
    fire: bool = False
    injury: bool = False
    complaint_date: Optional[date] = None

class ComplaintCreate(ComplaintBase):
    pass

class Complaint(ComplaintBase):
    id: int
    vehicle_id: int
    created_at: datetime
    class Config:
        from_attributes = True

class VehicleBase(BaseModel):
    vin: Optional[str] = None
    make: str
    model: str
    year: int

class VehicleCreate(VehicleBase):
    pass

class Vehicle(VehicleBase):
    id: int
    created_at: datetime
    recalls: List[Recall] = []
    complaints: List[Complaint] = []
    class Config:
        from_attributes = True

class SeverityIndicators(BaseModel):
    total_crashes: int
    total_fires: int
    total_injuries: int
    total_complaints: int

class DefectPattern(BaseModel):
    component: str
    count: int

class TrendPoint(BaseModel):
    year: str
    count: int

class DashboardResponse(BaseModel):
    vehicle: Vehicle
    severity: SeverityIndicators
    defect_patterns: List[DefectPattern]
    trends: List[TrendPoint]
    trends_by_component: dict
    state_distribution: List[dict]
