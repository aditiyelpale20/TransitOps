from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base

class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=False)
    driver_id = Column(Integer, ForeignKey("drivers.id", ondelete="SET NULL"), nullable=True)
    source = Column(String(150), nullable=False)
    destination = Column(String(150), nullable=False)
    cargo_weight = Column(Float, nullable=False) # in kg
    planned_distance = Column(Float, nullable=False) # in km
    actual_distance = Column(Float, default=0.0) # in km
    fuel_consumed = Column(Float, default=0.0) # in Liters
    status = Column(String(50), default="Pending") # Pending, Loading, On Trip, Arriving, Arrived, Completed, Delayed
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    vehicle = relationship("Vehicle", back_populates="trips")
    driver = relationship("Driver", back_populates="trips")
    fuel_logs = relationship("FuelLog", back_populates="trip", cascade="all, delete-orphan")
