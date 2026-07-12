from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.schemas.vehicle import VehicleResponse

class ExpenseBase(BaseModel):
    vehicle_id: int
    type: str = Field(..., max_length=50) # Toll, Permit, Insurance, Miscellaneous, Maintenance Overhead
    amount: float = Field(..., gt=0)
    description: Optional[str] = Field(None, max_length=255)

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(BaseModel):
    vehicle_id: Optional[int] = None
    type: Optional[str] = Field(None, max_length=50)
    amount: Optional[float] = Field(None, gt=0)
    description: Optional[str] = Field(None, max_length=255)

class ExpenseResponse(ExpenseBase):
    id: int
    date: datetime
    vehicle: Optional[VehicleResponse] = None

    class Config:
        from_attributes = True

