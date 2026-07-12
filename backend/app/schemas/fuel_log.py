from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.schemas.vehicle import VehicleResponse

class FuelLogBase(BaseModel):
    vehicle_id: int
    trip_id: Optional[int] = None
    liters: float = Field(..., gt=0)
    cost: float = Field(..., gt=0)

class FuelLogCreate(FuelLogBase):
    pass

class FuelLogUpdate(BaseModel):
    vehicle_id: Optional[int] = None
    trip_id: Optional[int] = None
    liters: Optional[float] = Field(None, gt=0)
    cost: Optional[float] = Field(None, gt=0)

class FuelLogResponse(FuelLogBase):
    id: int
    date: datetime
    vehicle: Optional[VehicleResponse] = None

    class Config:
        from_attributes = True

