from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.fuel_log import FuelLog
from app.models.vehicle import Vehicle
from app.schemas.fuel_log import FuelLogResponse, FuelLogCreate, FuelLogUpdate
from app.dependencies.auth import get_current_user, RoleChecker

router = APIRouter(prefix="/fuel", tags=["Fuel Logs"])

staff_required = RoleChecker(["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"])
manager_required = RoleChecker(["Fleet Manager"])

@router.get("", response_model=List[FuelLogResponse])
def read_fuel_logs(
    skip: int = 0,
    limit: int = 100,
    vehicle_id: Optional[int] = Query(None, description="Filter fuel logs by vehicle ID"),
    db: Session = Depends(get_db),
    current_user = Depends(staff_required)
):
    query = db.query(FuelLog)
    if vehicle_id:
        query = query.filter(FuelLog.vehicle_id == vehicle_id)
    return query.order_by(FuelLog.date.desc()).offset(skip).limit(limit).all()

@router.get("/{log_id}", response_model=FuelLogResponse)
def read_fuel_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(staff_required)
):
    log = db.query(FuelLog).filter(FuelLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fuel log not found")
    return log

@router.post("", response_model=FuelLogResponse, status_code=status.HTTP_201_CREATED)
def create_fuel_log(
    log_in: FuelLogCreate,
    db: Session = Depends(get_db),
    current_user = Depends(staff_required)
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == log_in.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
        
    log = FuelLog(**log_in.model_dump())
    db.add(log)
    db.commit()
    db.refresh(log)
    return log

@router.put("/{log_id}", response_model=FuelLogResponse)
def update_fuel_log(
    log_id: int,
    log_in: FuelLogUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(manager_required)
):
    log = db.query(FuelLog).filter(FuelLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fuel log not found")
        
    for key, val in log_in.model_dump(exclude_unset=True).items():
        setattr(log, key, val)
        
    db.commit()
    db.refresh(log)
    return log

@router.delete("/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_fuel_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(manager_required)
):
    log = db.query(FuelLog).filter(FuelLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fuel log not found")
    db.delete(log)
    db.commit()
    return None
