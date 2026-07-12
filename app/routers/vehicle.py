from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.vehicle import Vehicle
from app.schemas.vehicle import VehicleResponse, VehicleCreate, VehicleUpdate
from app.dependencies.auth import get_current_user, RoleChecker

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])

# Fleet Managers and Dispatchers have control over vehicles list
staff_required = RoleChecker(["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"])
manager_required = RoleChecker(["Fleet Manager"])

@router.get("", response_model=List[VehicleResponse])
def read_vehicles(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = Query(None, description="Filter vehicles by status"),
    vehicle_type: Optional[str] = Query(None, alias="type", description="Filter vehicles by type"),
    search: Optional[str] = Query(None, description="Search by registration number or model"),
    db: Session = Depends(get_db),
    current_user = Depends(staff_required)
):
    query = db.query(Vehicle)
    
    if status:
        query = query.filter(Vehicle.status == status)
    if vehicle_type:
        query = query.filter(Vehicle.vehicle_type == vehicle_type)
    if search:
        query = query.filter(
            Vehicle.registration_number.ilike(f"%{search}%") | 
            Vehicle.vehicle_name.ilike(f"%{search}%")
        )
        
    return query.offset(skip).limit(limit).all()

@router.get("/{vehicle_id}", response_model=VehicleResponse)
def read_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(staff_required)
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
    return vehicle

@router.post("", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
def create_vehicle(
    vehicle_in: VehicleCreate,
    db: Session = Depends(get_db),
    current_user = Depends(manager_required)
):
    # Verify registration uniqueness
    existing = db.query(Vehicle).filter(Vehicle.registration_number == vehicle_in.registration_number).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Registration plate '{vehicle_in.registration_number}' is already registered."
        )
    
    vehicle = Vehicle(**vehicle_in.model_dump())
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle

@router.put("/{vehicle_id}", response_model=VehicleResponse)
def update_vehicle(
    vehicle_id: int,
    vehicle_in: VehicleUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(manager_required)
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
    
    # Block operations if vehicle is retired
    if vehicle.status == "Retired" and vehicle_in.status and vehicle_in.status != "Retired":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Retired vehicles can never become Available again."
        )

    # Verify registration uniqueness if changing
    if vehicle_in.registration_number and vehicle_in.registration_number != vehicle.registration_number:
        existing = db.query(Vehicle).filter(Vehicle.registration_number == vehicle_in.registration_number).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Registration plate already registered")
    
    for key, val in vehicle_in.model_dump(exclude_unset=True).items():
        setattr(vehicle, key, val)
        
    db.commit()
    db.refresh(vehicle)
    return vehicle

@router.delete("/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(manager_required)
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
    db.delete(vehicle)
    db.commit()
    return None
