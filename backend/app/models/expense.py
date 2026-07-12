from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(50), nullable=False) # Toll, Permit, Insurance, Miscellaneous, Maintenance Overhead
    amount = Column(Float, nullable=False)
    description = Column(String(255), nullable=True)
    date = Column(DateTime, server_default=func.now())

    # Relationships
    vehicle = relationship("Vehicle", back_populates="expenses")
