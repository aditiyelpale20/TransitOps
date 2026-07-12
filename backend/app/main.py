from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import Base, initialize_database
from app.seed.seed import seed_database

# Import routers
from app.routers import auth, user, vehicle, driver, trip, maintenance, fuel_log, expense, reports


@asynccontextmanager
async def lifespan(app: FastAPI):
    db_engine = initialize_database()
    Base.metadata.create_all(bind=db_engine)
    if settings.SEED_ON_STARTUP:
        seed_database(force=False)
    yield


app = FastAPI(
    title=settings.APP_NAME,
    description="TransitOps Logistics and Fleet Management System API",
    version="1.0.0",
    debug=settings.DEBUG,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS_LIST,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Router paths
app.include_router(auth.router)
app.include_router(user.router)
app.include_router(vehicle.router)
app.include_router(driver.router)
app.include_router(trip.router)
app.include_router(maintenance.router)
app.include_router(fuel_log.router)
app.include_router(expense.router)
app.include_router(reports.router)


@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": settings.APP_NAME,
        "message": "TransitOps API is fully active and listening."
    }
