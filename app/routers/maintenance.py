from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.maintenance import Maintenance
from app.models.vehicle import Vehicle
from app.schemas.maintenance import MaintenanceResponse, MaintenanceCreate, MaintenanceUpdate
from app.dependencies.auth import get_current_user, RoleChecker

router = APIRouter(prefix="/maintenance", tags=["Maintenance"])

staff_required = RoleChecker(["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"])
manager_required = RoleChecker(["Fleet Manager"])

@router.get("", response_model=List[MaintenanceResponse])
def read_maintenances(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = Query(None, description="Filter logs by Active/Completed status"),
    search: Optional[str] = Query(None, description="Search by issues description"),
    db: Session = Depends(get_db),
    current_user = Depends(staff_required)
):
    query = db.query(Maintenance)
    if status:
        query = query.filter(Maintenance.status == status)
    if search:
        query = query.filter(
            Maintenance.issue.ilike(f"%{search}%") | 
            Maintenance.description.ilike(f"%{search}%")
        )
    return query.order_by(Maintenance.start_date.desc()).offset(skip).limit(limit).all()

@router.get("/{maintenance_id}", response_model=MaintenanceResponse)
def read_maintenance(
    maintenance_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(staff_required)
):
    maintenance = db.query(Maintenance).filter(Maintenance.id == maintenance_id).first()
    if not maintenance:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Maintenance log not found")
    return maintenance

@router.post("", response_model=MaintenanceResponse, status_code=status.HTTP_201_CREATED)
def create_maintenance(
    maintenance_in: MaintenanceCreate,
    db: Session = Depends(get_db),
    current_user = Depends(manager_required)
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == maintenance_in.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
        
    # Open ticket validates vehicle is not retired
    if vehicle.status == "Retired":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Retired vehicles cannot undergo maintenance")

    # Set vehicle status to "In Shop"
    if maintenance_in.status == "Active (In Shop)":
        vehicle.status = "In Shop"

    maintenance = Maintenance(**maintenance_in.model_dump())
    db.add(maintenance)
    db.commit()
    db.refresh(maintenance)
    return maintenance

@router.put("/{maintenance_id}", response_model=MaintenanceResponse)
def update_maintenance(
    maintenance_id: int,
    maintenance_in: MaintenanceUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(manager_required)
):
    maintenance = db.query(Maintenance).filter(Maintenance.id == maintenance_id).first()
    if not maintenance:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Maintenance log not found")

    old_status = maintenance.status
    new_status = maintenance_in.status or old_status

    vehicle = db.query(Vehicle).filter(Vehicle.id == maintenance.vehicle_id).first()

    # Manage transitions
    if new_status == "Completed" and old_status != "Completed":
        maintenance.end_date = date.today()
        # Closing Maintenance returns vehicle status to Available (unless retired)
        if vehicle and vehicle.status != "Retired":
            vehicle.status = "Available"

    for key, val in maintenance_in.model_dump(exclude_unset=True).items():
        setattr(maintenance, key, val)
        
    db.commit()
    db.refresh(maintenance)
    return maintenance

@router.delete("/{maintenance_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_maintenance(
    maintenance_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(manager_required)
):
    maintenance = db.query(Maintenance).filter(Maintenance.id == maintenance_id).first()
    if not maintenance:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Maintenance log not found")
        
    # Restore vehicle status if active log is deleted
    if maintenance.status == "Active (In Shop)":
        vehicle = db.query(Vehicle).filter(Vehicle.id == maintenance.vehicle_id).first()
        if vehicle and vehicle.status != "Retired":
            vehicle.status = "Available"
            
    db.delete(maintenance)
    db.commit()
    return None
