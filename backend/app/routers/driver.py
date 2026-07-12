from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.driver import Driver
from app.schemas.driver import DriverResponse, DriverCreate, DriverUpdate
from app.dependencies.auth import get_current_user, RoleChecker

router = APIRouter(prefix="/drivers", tags=["Drivers"])

staff_required = RoleChecker(["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"])
manager_required = RoleChecker(["Fleet Manager"])

@router.get("", response_model=List[DriverResponse])
def read_drivers(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = Query(None, description="Filter drivers by availability status"),
    category: Optional[str] = Query(None, description="Filter drivers by HMV or LMV licenses"),
    search: Optional[str] = Query(None, description="Search by name, phone or license number"),
    db: Session = Depends(get_db),
    current_user = Depends(staff_required)
):
    query = db.query(Driver)
    
    if status:
        query = query.filter(Driver.status == status)
    if category:
        query = query.filter(Driver.license_category == category)
    if search:
        query = query.filter(
            Driver.name.ilike(f"%{search}%") | 
            Driver.phone.ilike(f"%{search}%") | 
            Driver.license_number.ilike(f"%{search}%")
        )
        
    return query.offset(skip).limit(limit).all()

@router.get("/{driver_id}", response_model=DriverResponse)
def read_driver(
    driver_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(staff_required)
):
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driver not found")
    return driver

@router.post("", response_model=DriverResponse, status_code=status.HTTP_201_CREATED)
def create_driver(
    driver_in: DriverCreate,
    db: Session = Depends(get_db),
    current_user = Depends(manager_required)
):
    # Verify license number uniqueness
    existing = db.query(Driver).filter(Driver.license_number == driver_in.license_number).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"License number '{driver_in.license_number}' is already registered."
        )
        
    driver = Driver(**driver_in.model_dump())
    db.add(driver)
    db.commit()
    db.refresh(driver)
    return driver

@router.put("/{driver_id}", response_model=DriverResponse)
def update_driver(
    driver_id: int,
    driver_in: DriverUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(manager_required)
):
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driver not found")
        
    # Verify license number uniqueness if changing
    if driver_in.license_number and driver_in.license_number != driver.license_number:
        existing = db.query(Driver).filter(Driver.license_number == driver_in.license_number).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="License number already registered")
            
    for key, val in driver_in.model_dump(exclude_unset=True).items():
        setattr(driver, key, val)
        
    db.commit()
    db.refresh(driver)
    return driver

@router.delete("/{driver_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_driver(
    driver_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(manager_required)
):
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driver not found")
    db.delete(driver)
    db.commit()
    return None

