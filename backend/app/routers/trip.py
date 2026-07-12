from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.trip import Trip
from app.models.vehicle import Vehicle
from app.models.driver import Driver
from app.schemas.trip import TripResponse, TripCreate, TripUpdate
from app.dependencies.auth import get_current_user, RoleChecker

router = APIRouter(prefix="/trips", tags=["Trips"])

staff_required = RoleChecker(["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"])
dispatcher_required = RoleChecker(["Fleet Manager", "Dispatcher"])

@router.get("", response_model=List[TripResponse])
def read_trips(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = Query(None, description="Filter trips by status"),
    search: Optional[str] = Query(None, description="Search by source or destination"),
    db: Session = Depends(get_db),
    current_user = Depends(staff_required)
):
    query = db.query(Trip)
    if status:
        query = query.filter(Trip.status == status)
    if search:
        query = query.filter(
            Trip.source.ilike(f"%{search}%") | 
            Trip.destination.ilike(f"%{search}%")
        )
    return query.order_by(Trip.created_at.desc()).offset(skip).limit(limit).all()

@router.get("/{trip_id}", response_model=TripResponse)
def read_trip(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(staff_required)
):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")
    return trip

@router.post("", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
def create_trip(
    trip_in: TripCreate,
    db: Session = Depends(get_db),
    current_user = Depends(dispatcher_required)
):
    # Fetch and validate Vehicle properties
    vehicle = db.query(Vehicle).filter(Vehicle.id == trip_in.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
    
    # Validation: Vehicle On Trip / In Shop cannot be reassigned
    if vehicle.status == "On Trip":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Vehicle is already dispatched on another trip")
    if vehicle.status == "In Shop":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Vehicle is currently undergoing maintenance")
    if vehicle.status == "Retired":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Vehicle is retired from service")
        
    # Validation: Cargo weight capacity check
    if trip_in.cargo_weight > vehicle.max_load_capacity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cargo weight ({trip_in.cargo_weight} kg) exceeds vehicle maximum capacity ({vehicle.max_load_capacity} kg)"
        )

    # Fetch and validate Driver properties if provided
    driver = None
    if trip_in.driver_id:
        driver = db.query(Driver).filter(Driver.id == trip_in.driver_id).first()
        if not driver:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driver not found")
            
        # Validation: Expired drivers cannot be assigned
        if driver.license_expiry < date.today():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Driver's license is expired")
            
        # Validation: Suspended drivers cannot be assigned
        if driver.status == "Suspended":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Driver is currently suspended")
            
        # Validation: Driver already On Trip cannot be assigned
        if driver.status == "On Trip":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Driver is currently assigned to another active trip")

    # Set new statuses for assets if dispatch is active
    status_val = trip_in.status
    if status_val in ["On Trip", "Loading", "Pending"]:
        vehicle.status = "On Trip"
        if driver:
            driver.status = "On Trip"

    trip = Trip(**trip_in.model_dump())
    db.add(trip)
    db.commit()
    db.refresh(trip)
    return trip

@router.put("/{trip_id}", response_model=TripResponse)
def update_trip(
    trip_id: int,
    trip_in: TripUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(dispatcher_required)
):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")

    old_status = trip.status
    new_status = trip_in.status or old_status

    # Gather involved assets
    vehicle = db.query(Vehicle).filter(Vehicle.id == (trip_in.vehicle_id or trip.vehicle_id)).first()
    driver = None
    drv_id = trip_in.driver_id or trip.driver_id
    if drv_id:
        driver = db.query(Driver).filter(Driver.id == drv_id).first()

    # Handle transitions
    if new_status in ["Completed", "Cancelled"] and old_status not in ["Completed", "Cancelled"]:
        # Free up the assets
        if vehicle:
            # Check if vehicle is In Shop (e.g. was booked into maintenance during route)
            # otherwise mark Available
            vehicle.status = "Available"
            if trip_in.actual_distance:
                vehicle.odometer += trip_in.actual_distance
        if driver:
            driver.status = "Available"
    elif new_status == "On Trip" and old_status != "On Trip":
        # Dispatched - mark involved assets as On Trip
        if vehicle:
            vehicle.status = "On Trip"
        if driver:
            driver.status = "On Trip"

    # Save details
    for key, val in trip_in.model_dump(exclude_unset=True).items():
        setattr(trip, key, val)
        
    db.commit()
    db.refresh(trip)
    return trip

@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trip(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(dispatcher_required)
):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")
        
    # Free up status of assets if active trip is being deleted
    if trip.status not in ["Completed", "Cancelled"]:
        vehicle = db.query(Vehicle).filter(Vehicle.id == trip.vehicle_id).first()
        if vehicle:
            vehicle.status = "Available"
        driver = db.query(Driver).filter(Driver.id == trip.driver_id).first()
        if driver:
            driver.status = "Available"

    db.delete(trip)
    db.commit()
    return None

@router.get("/{trip_id}/telemetry")
def get_trip_telemetry(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(staff_required)
):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
        
    if trip.status != "On Trip":
        return {
            "status": trip.status,
            "speed": 0.0,
            "lat": 0.0,
            "lng": 0.0,
            "distance_traveled": 0.0,
            "distance_remaining": trip.planned_distance,
            "eta_minutes": 0,
            "progress_pct": 0
        }

    # Seeded city coordinates for interpolation
    coordinates = {
        "Mumbai": (18.97, 72.82),
        "Pune": (18.52, 73.85),
        "Delhi": (28.61, 77.20),
        "Jaipur": (26.91, 75.78),
        "Bengaluru": (12.97, 77.59),
        "Mysuru": (12.29, 76.63),
        "Chennai": (13.08, 80.27),
        "Coimbatore": (11.01, 76.95),
        "Hyderabad": (17.38, 78.48),
        "Vijayawada": (16.50, 80.64),
        "Ahmedabad": (23.02, 72.57),
        "Surat": (21.17, 72.83)
    }

    # Extract source/destination base city names
    source_city = trip.source.replace(" Depot", "").replace(" Hub", "").strip()
    dest_city = trip.destination.replace(" Depot", "").replace(" Hub", "").strip()

    start_coords = coordinates.get(source_city, (18.97, 72.82))
    end_coords = coordinates.get(dest_city, (18.52, 73.85))

    # Calculate simulated progress based on current time
    import time
    cycle_duration = 120.0  # seconds for a full route cycle
    progress = (time.time() % cycle_duration) / cycle_duration

    # Simulated weather conditions & speed modifiers
    weather_options = [
        {"condition": "Clear Sky", "speed_mod": 1.0, "status": "Clear", "icon": "sunny"},
        {"condition": "Heavy Monsoon Rain", "speed_mod": 0.75, "status": "Caution", "icon": "rain"},
        {"condition": "Dense Winter Fog", "speed_mod": 0.60, "status": "Warning", "icon": "fog"},
        {"condition": "High Winds", "speed_mod": 0.85, "status": "Caution", "icon": "wind"}
    ]
    # Rotate weather condition every 25 seconds deterministically based on timestamp + trip_id
    weather_idx = int((time.time() // 25) + trip_id) % len(weather_options)
    weather = weather_options[weather_idx]

    # Calculate current speed with weather modifier
    base_speed = 58.0 + (time.time() % 12.0)
    speed = round(base_speed * weather["speed_mod"], 1)

    distance_traveled = round(trip.planned_distance * progress, 1)
    distance_remaining = round(trip.planned_distance - distance_traveled, 1)
    
    # Calculate ETA minutes
    eta_minutes = int((distance_remaining / speed) * 60) if speed > 0 else 0

    # Interpolate coords
    lat = round(start_coords[0] + (end_coords[0] - start_coords[0]) * progress, 5)
    lng = round(start_coords[1] + (end_coords[1] - start_coords[1]) * progress, 5)

    return {
        "status": trip.status,
        "speed": speed,
        "lat": lat,
        "lng": lng,
        "distance_traveled": distance_traveled,
        "distance_remaining": distance_remaining,
        "eta_minutes": eta_minutes,
        "progress_pct": int(progress * 100),
        "weather": {
            "condition": weather["condition"],
            "status": weather["status"],
            "icon": weather["icon"]
        }
    }
