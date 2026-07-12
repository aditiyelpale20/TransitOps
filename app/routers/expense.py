from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.expense import Expense
from app.models.vehicle import Vehicle
from app.schemas.expense import ExpenseResponse, ExpenseCreate, ExpenseUpdate
from app.dependencies.auth import get_current_user, RoleChecker

router = APIRouter(prefix="/expenses", tags=["Expenses"])

staff_required = RoleChecker(["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"])
manager_required = RoleChecker(["Fleet Manager", "Financial Analyst"])

@router.get("", response_model=List[ExpenseResponse])
def read_expenses(
    skip: int = 0,
    limit: int = 100,
    expense_type: Optional[str] = Query(None, alias="type", description="Filter by expense type"),
    search: Optional[str] = Query(None, description="Search description text"),
    db: Session = Depends(get_db),
    current_user = Depends(staff_required)
):
    query = db.query(Expense)
    if expense_type:
        query = query.filter(Expense.type == expense_type)
    if search:
        query = query.filter(Expense.description.ilike(f"%{search}%"))
    return query.order_by(Expense.date.desc()).offset(skip).limit(limit).all()

@router.get("/{expense_id}", response_model=ExpenseResponse)
def read_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(staff_required)
):
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense record not found")
    return expense

@router.post("", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_expense(
    expense_in: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user = Depends(manager_required)
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == expense_in.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
        
    expense = Expense(**expense_in.model_dump())
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense

@router.put("/{expense_id}", response_model=ExpenseResponse)
def update_expense(
    expense_id: int,
    expense_in: ExpenseUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(manager_required)
):
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense record not found")
        
    for key, val in expense_in.model_dump(exclude_unset=True).items():
        setattr(expense, key, val)
        
    db.commit()
    db.refresh(expense)
    return expense

@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(manager_required)
):
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense record not found")
    db.delete(expense)
    db.commit()
    return None
