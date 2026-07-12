from datetime import date
from typing import Optional
from pydantic import BaseModel, Field
from app.schemas.vehicle import VehicleResponse

class MaintenanceBase(BaseModel):
    vehicle_id: int
    issue: str = Field(..., max_length=150)
    description: Optional[str] = Field(None, max_length=255)
    cost: float = Field(default=0.0, ge=0)
    status: str = Field(default="Active (In Shop)") # Active (In Shop), Completed
    start_date: date
    end_date: Optional[date] = None

class MaintenanceCreate(MaintenanceBase):
    pass

class MaintenanceUpdate(BaseModel):
    vehicle_id: Optional[int] = None
    issue: Optional[str] = Field(None, max_length=150)
    description: Optional[str] = Field(None, max_length=255)
    cost: Optional[float] = Field(None, ge=0)
    status: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None

class MaintenanceResponse(MaintenanceBase):
    id: int
    vehicle: Optional[VehicleResponse] = None

    class Config:
        from_attributes = True

