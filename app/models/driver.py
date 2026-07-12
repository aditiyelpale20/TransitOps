from sqlalchemy import Column, Integer, String, Date, Float
from sqlalchemy.orm import relationship
from app.database import Base

class Driver(Base):
    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    license_number = Column(String(50), unique=True, index=True, nullable=False)
    license_category = Column(String(50), nullable=False) # HMV (Heavy), LMV (Light)
    license_expiry = Column(Date, nullable=False)
    phone = Column(String(20), nullable=False)
    safety_score = Column(Float, default=100.0) # Percentage safety score (0-100)
    status = Column(String(50), default="Available") # Available, On Trip, Off Duty, Suspended

    # Relationships
    trips = relationship("Trip", back_populates="driver")
