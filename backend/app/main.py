
from datetime import date

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from .database import Base, engine, SessionLocal
from . import models

app = FastAPI(
    title="Construction Project Control API",
    description=(
        "API for construction project monitoring, "
        "budget management, progress tracking, and forecasting."
    ),
    version="0.2.0",
)

# Create database tables if they do not already exist.
Base.metadata.create_all(bind=engine)

# Allow the local React development server to access this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
    "https://construction-project-control-h6hmjq2od.vercel.app",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Database session for each request.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Validate the information received when creating a project.
class ProjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    project_code: str = Field(min_length=1, max_length=50)
    location: str = Field(min_length=1, max_length=150)

    approved_budget: float = Field(ge=0)
    recorded_cost: float = Field(default=0, ge=0)
    planned_progress: float = Field(default=0, ge=0, le=100)
    actual_progress: float = Field(default=0, ge=0, le=100)

    start_date: date | None = None
    end_date: date | None = None
    status: str = Field(default="Active", max_length=30)


# Format database records as API responses.
def project_response(project):
    return {
        "id": project.id,
        "name": project.name,
        "project_code": project.project_code,
        "location": project.location,
        "approved_budget": project.approved_budget,
        "recorded_cost": project.recorded_cost,
        "planned_progress": project.planned_progress,
        "actual_progress": project.actual_progress,
        "start_date": project.start_date,
        "end_date": project.end_date,
        "status": project.status,
    }


@app.get("/")
def root():
    return {
        "message": "Construction Project Control API is running",
        "project": "Construction Project Control & Forecasting Platform",
        "version": "0.2.0",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "construction-project-control-api",
    }


# Retrieve all saved projects.
@app.get("/projects")
def list_projects(db: Session = Depends(get_db)):
    projects = db.query(models.Project).order_by(models.Project.id).all()
    return [project_response(project) for project in projects]


# Save a new project.
@app.post("/projects", status_code=201)
def create_project(
    project_data: ProjectCreate,
    db: Session = Depends(get_db),
):
    existing_project = (
        db.query(models.Project)
        .filter(models.Project.project_code == project_data.project_code)
        .first()
    )

    if existing_project:
        raise HTTPException(
            status_code=409,
            detail="A project with this project code already exists.",
        )

    if (
        project_data.start_date
        and project_data.end_date
        and project_data.end_date < project_data.start_date
    ):
        raise HTTPException(
            status_code=422,
            detail="End date cannot be earlier than start date.",
        )

    project = models.Project(**project_data.model_dump())
    db.add(project)
    db.commit()
    db.refresh(project)

    return project_response(project)
