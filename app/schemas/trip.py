from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.schemas.vehicle import VehicleResponse
from app.schemas.driver import DriverResponse

class TripBase(BaseModel):
    vehicle_id: int
    driver_id: Optional[int] = None
    source: str = Field(..., max_length=150)
    destination: str = Field(..., max_length=150)
    cargo_weight: float = Field(..., gt=0)
    planned_distance: float = Field(..., gt=0)
    actual_distance: float = Field(default=0.0, ge=0)
    fuel_consumed: float = Field(default=0.0, ge=0)
    status: str = Field(default="Pending") # Pending, Loading, On Trip, Arrived, Completed, Delayed

class TripCreate(TripBase):
    pass

class TripUpdate(BaseModel):
    vehicle_id: Optional[int] = None
    driver_id: Optional[int] = None
    source: Optional[str] = Field(None, max_length=150)
    destination: Optional[str] = Field(None, max_length=150)
    cargo_weight: Optional[float] = Field(None, gt=0)
    planned_distance: Optional[float] = Field(None, gt=0)
    actual_distance: Optional[float] = Field(None, ge=0)
    fuel_consumed: Optional[float] = Field(None, ge=0)
    status: Optional[str] = None

class TripResponse(TripBase):
    id: int
    created_at: datetime
    vehicle: Optional[VehicleResponse] = None
    driver: Optional[DriverResponse] = None

    class Config:
        from_attributes = True

