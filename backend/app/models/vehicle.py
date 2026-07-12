from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.orm import relationship
from app.database import Base

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    registration_number = Column(String(50), unique=True, index=True, nullable=False) # e.g. MH-12-GQ-4521
    vehicle_name = Column(String(100), nullable=False) # e.g. Tata Prima, Ashok Leyland
    vehicle_type = Column(String(50), nullable=False) # e.g. Truck, Semi, Box Truck, Van
    max_load_capacity = Column(Float, nullable=False) # in kg
    odometer = Column(Float, default=0.0) # in km
    acquisition_cost = Column(Float, nullable=False)
    status = Column(String(50), default="Available") # Available, On Trip, In Shop, Retired

    # Relationships
    trips = relationship("Trip", back_populates="vehicle", cascade="all, delete-orphan")
    maintenances = relationship("Maintenance", back_populates="vehicle", cascade="all, delete-orphan")
    fuel_logs = relationship("FuelLog", back_populates="vehicle", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="vehicle", cascade="all, delete-orphan")
