from datetime import date
from typing import Optional
from pydantic import BaseModel, Field

class DriverBase(BaseModel):
    name: str = Field(..., max_length=100)
    license_number: str = Field(..., max_length=50)
    license_category: str = Field(..., description="HMV, LMV")
    license_expiry: date
    phone: str = Field(..., max_length=20)
    safety_score: float = Field(default=100.0, ge=0, le=100)
    status: str = Field(default="Available") # Available, On Trip, Off Duty, Suspended

class DriverCreate(DriverBase):
    pass

class DriverUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    license_number: Optional[str] = Field(None, max_length=50)
    license_category: Optional[str] = None
    license_expiry: Optional[date] = None
    phone: Optional[str] = Field(None, max_length=20)
    safety_score: Optional[float] = Field(None, ge=0, le=100)
    status: Optional[str] = None

class DriverResponse(DriverBase):
    id: int

    class Config:
        from_attributes = True

