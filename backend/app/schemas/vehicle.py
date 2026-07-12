from typing import Optional
from pydantic import BaseModel, Field

class VehicleBase(BaseModel):
    registration_number: str = Field(..., max_length=50)
    vehicle_name: str = Field(..., max_length=100)
    vehicle_type: str = Field(..., max_length=50) # Truck, Semi, Box Truck, Van
    max_load_capacity: float = Field(..., gt=0) # in kg
    odometer: float = Field(default=0.0, ge=0)
    acquisition_cost: float = Field(..., gt=0)
    status: str = Field(default="Available") # Available, On Trip, In Shop, Retired

class VehicleCreate(VehicleBase):
    pass

class VehicleUpdate(BaseModel):
    registration_number: Optional[str] = Field(None, max_length=50)
    vehicle_name: Optional[str] = Field(None, max_length=100)
    vehicle_type: Optional[str] = Field(None, max_length=50)
    max_load_capacity: Optional[float] = Field(None, gt=0)
    odometer: Optional[float] = Field(None, ge=0)
    acquisition_cost: Optional[float] = Field(None, gt=0)
    status: Optional[str] = None

class VehicleResponse(VehicleBase):
    id: int

    class Config:
        from_attributes = True

