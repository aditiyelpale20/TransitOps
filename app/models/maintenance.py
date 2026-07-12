from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Maintenance(Base):
    __tablename__ = "maintenances"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=False)
    issue = Column(String(150), nullable=False) # e.g. Engine Repair, Oil Change
    description = Column(String(255), nullable=True)
    cost = Column(Float, default=0.0)
    status = Column(String(50), default="Active (In Shop)") # Active (In Shop), Completed
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)

    # Relationships
    vehicle = relationship("Vehicle", back_populates="maintenances")
