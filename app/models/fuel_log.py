from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base

class FuelLog(Base):
    __tablename__ = "fuel_logs"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=False)
    trip_id = Column(Integer, ForeignKey("trips.id", ondelete="SET NULL"), nullable=True)
    liters = Column(Float, nullable=False)
    cost = Column(Float, nullable=False)
    date = Column(DateTime, server_default=func.now())

    # Relationships
    vehicle = relationship("Vehicle", back_populates="fuel_logs")
    trip = relationship("Trip", back_populates="fuel_logs")
