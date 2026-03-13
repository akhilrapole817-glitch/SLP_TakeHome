from sqlalchemy import Column, Integer, String, Boolean, Text, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    vin = Column(String(17), unique=True, index=True, nullable=True)
    make = Column(String(100), index=True, nullable=False)
    model = Column(String(100), index=True, nullable=False)
    year = Column(Integer, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    recalls = relationship("Recall", back_populates="vehicle")
    complaints = relationship("Complaint", back_populates="vehicle")

class Recall(Base):
    __tablename__ = "recalls"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"))
    nhtsa_campaign_number = Column(String(50))
    component = Column(String(255))
    description = Column(Text)
    consequence = Column(Text)
    remedy = Column(Text)
    manufacturer = Column(String(255))
    issue_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    vehicle = relationship("Vehicle", back_populates="recalls")

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"))
    vin = Column(String(17), index=True, nullable=True)
    make = Column(String(100))
    model = Column(String(100))
    year = Column(Integer)
    component = Column(String(255))
    description = Column(Text)
    state = Column(String(10))
    crash = Column(Boolean, default=False)
    fire = Column(Boolean, default=False)
    injury = Column(Boolean, default=False)
    complaint_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    vehicle = relationship("Vehicle", back_populates="complaints")
