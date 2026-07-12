import os
import random
import sys
from datetime import date, datetime, timedelta

# Adjust path to import backend modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import Base, SessionLocal, engine
from app.models.driver import Driver
from app.models.expense import Expense
from app.models.fuel_log import FuelLog
from app.models.maintenance import Maintenance
from app.models.trip import Trip
from app.models.user import User
from app.models.vehicle import Vehicle
from app.utils.security import get_password_hash


def seed_database(force: bool = False):
    if force:
        print("Dropping existing database tables (force=True)...")
        Base.metadata.drop_all(bind=engine)
        
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        existing_user_count = db.query(User).count()
        if existing_user_count > 0 and not force:
            print("Database already contains user records. Skipping seed operation to avoid overwriting data.")
            return False

        print("Seeding administrative user accounts...")
        admin_user = User(
            name="Alex Rivera",
            email="admin@transitops.com",
            password_hash=get_password_hash("admin123"),
            role="Fleet Manager",
        )
        dispatcher_user = User(
            name="J. Carter",
            email="dispatcher@transitops.com",
            password_hash=get_password_hash("dispatcher123"),
            role="Dispatcher",
        )
        safety_user = User(
            name="Vikram Singh",
            email="safety@transitops.com",
            password_hash=get_password_hash("safety123"),
            role="Safety Officer",
        )
        finance_user = User(
            name="Sanjay Kumar",
            email="finance@transitops.com",
            password_hash=get_password_hash("finance123"),
            role="Financial Analyst",
        )
        db.add_all([admin_user, dispatcher_user, safety_user, finance_user])
        db.commit()

        print("Seeding 20 vehicles...")
        regions = ["MH-12", "DL-01", "KA-03", "TN-09", "GJ-05"]
        types = ["Truck", "Semi", "Box Truck", "Van"]
        v_names = {
            "Truck": ["Tata LPT 1618", "Ashok Leyland 1920", "BharatBenz 1917R"],
            "Semi": ["Tata Prima 5530.S", "Ashok Leyland 5525", "Mahindra Blazo X 55"],
            "Box Truck": ["Eicher Pro 3019", "Tata Ultra T.16", "BharatBenz 1217C"],
            "Van": ["Tata Winger Cargo", "Mahindra Supro", "Force Traveller Monobus"],
        }

        vehicles = []
        for i in range(1, 21):
            reg_num = f"{random.choice(regions)}-{random.choice(['AB', 'GQ', 'XY', 'KL'])}-{random.randint(1000, 9999)}"
            v_type = random.choice(types)
            v_name = random.choice(v_names[v_type])
            capacity = 40000.0 if v_type == "Semi" else 18000.0 if v_type == "Truck" else 8000.0 if v_type == "Box Truck" else 2000.0
            odometer = float(random.randint(5000, 150000))
            cost = float(random.randint(1200000, 6500000))
            status = "Available" if i <= 15 else "On Trip" if i <= 18 else "In Shop" if i == 19 else "Retired"

            vehicle = Vehicle(
                registration_number=reg_num,
                vehicle_name=v_name,
                vehicle_type=v_type,
                max_load_capacity=capacity,
                odometer=odometer,
                acquisition_cost=cost,
                status=status,
            )
            db.add(vehicle)
            vehicles.append(vehicle)
        db.commit()

        print("Seeding 20 drivers...")
        first_names = ["Rajesh", "Vikram", "Amit", "Sanjay", "Rohan", "Sunil", "Vijay", "Anil", "Deepak", "Manoj", "Arun", "Karan", "Suraj", "Ajay", "Rahul", "Pawan", "Vinod", "Jaspal", "Harpreet", "Gurpreet"]
        last_names = ["Kumar", "Singh", "Sharma", "Patel", "Reddy", "Verma", "Joshi", "Yadav", "Nair", "Choudhury", "Gupta", "Rao", "Shetty", "Deshmukh", "Gowda", "Gill"]

        drivers = []
        for i in range(1, 21):
            name = f"{random.choice(first_names)} {random.choice(last_names)}"
            lic_num = f"DL-{random.randint(10000000, 99999999)}"
            category = "HMV" if i <= 14 else "LMV"
            expiry = date.today() + timedelta(days=random.randint(100, 1500))
            phone = f"+91-{random.randint(70000, 99999)}-{random.randint(10000, 99999)}"
            safety = float(random.randint(75, 100))
            status = "Available" if i <= 14 else "On Trip" if i <= 18 else "Off Duty" if i == 19 else "Suspended"

            driver = Driver(
                name=name,
                license_number=lic_num,
                license_category=category,
                license_expiry=expiry,
                phone=phone,
                safety_score=safety,
                status=status,
            )
            db.add(driver)
            drivers.append(driver)
        db.commit()

        print("Seeding 40 trips...")
        routes = [
            ("Mumbai", "Pune", 150.0),
            ("Delhi", "Jaipur", 270.0),
            ("Bengaluru", "Mysuru", 145.0),
            ("Chennai", "Coimbatore", 500.0),
            ("Hyderabad", "Vijayawada", 275.0),
            ("Ahmedabad", "Surat", 260.0),
        ]
        statuses = ["Completed", "Completed", "Completed", "On Trip", "Pending", "Cancelled"]

        trips = []
        for i in range(1, 41):
            route = random.choice(routes)
            vehicle = random.choice(vehicles)
            driver = random.choice(drivers)
            dist = route[2]
            status = random.choice(statuses)

            if i <= 3:
                status = "On Trip"
                vehicle.status = "On Trip"
                driver.status = "On Trip"
            elif i > 30:
                status = "Completed"

            act_dist = dist if status == "Completed" else 0.0
            fuel = round(act_dist / random.uniform(3.5, 6.0), 2) if status == "Completed" else 0.0
            cargo = random.randint(1000, int(vehicle.max_load_capacity))

            trip = Trip(
                vehicle_id=vehicle.id,
                driver_id=driver.id,
                source=f"{route[0]} Depot",
                destination=f"{route[1]} Hub",
                cargo_weight=float(cargo),
                planned_distance=dist,
                actual_distance=act_dist,
                fuel_consumed=fuel,
                status=status,
                created_at=datetime.now() - timedelta(days=random.randint(1, 60)),
            )
            db.add(trip)
            trips.append(trip)
        db.commit()

        print("Seeding 30 fuel logs...")
        completed_trips = [trip for trip in trips if trip.status == "Completed"]
        for _ in range(30):
            trip = random.choice(completed_trips) if completed_trips else None
            vehicle = trip.vehicle if trip else random.choice(vehicles)
            liters = random.uniform(30.0, 150.0)
            cost = liters * random.uniform(90.0, 100.0)

            fuel_log = FuelLog(
                vehicle_id=vehicle.id,
                trip_id=trip.id if trip else None,
                liters=round(liters, 2),
                cost=round(cost, 2),
                date=datetime.now() - timedelta(days=random.randint(1, 45)),
            )
            db.add(fuel_log)
        db.commit()

        print("Seeding 30 maintenance logs...")
        issues = ["Engine Overheating", "Brake Pad Replacement", "Oil Change & Filters", "Suspension Tuning", "Tyre Rotation", "Gearbox Alignment"]
        for i in range(30):
            vehicle = random.choice(vehicles)
            issue = random.choice(issues)
            m_status = "Completed" if i <= 27 else "Active (In Shop)"

            if m_status == "Active (In Shop)":
                vehicle.status = "In Shop"

            cost = float(random.randint(1500, 45000))
            start = date.today() - timedelta(days=random.randint(5, 90))
            end = start + timedelta(days=random.randint(1, 4)) if m_status == "Completed" else None

            maintenance = Maintenance(
                vehicle_id=vehicle.id,
                issue=issue,
                description=f"Standard scheduled check for {issue.lower()}.",
                cost=cost,
                status=m_status,
                start_date=start,
                end_date=end,
            )
            db.add(maintenance)
        db.commit()

        print("Seeding 50 expenses...")
        exp_types = ["Toll", "Permit", "Insurance", "Miscellaneous", "Maintenance Overhead"]
        for _ in range(50):
            vehicle = random.choice(vehicles)
            exp_type = random.choice(exp_types)
            amount = float(random.randint(200, 12000))

            expense = Expense(
                vehicle_id=vehicle.id,
                type=exp_type,
                amount=amount,
                description=f"Operational charge for {exp_type.lower()}.",
                date=datetime.now() - timedelta(days=random.randint(1, 60)),
            )
            db.add(expense)
        db.commit()

        print("Database seeded successfully with local Indian logistics data!")
        return True
    except Exception as exc:
        print(f"An error occurred during database seeding: {exc}", file=sys.stderr)
        db.rollback()
        return False
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
