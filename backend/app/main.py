
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


class TaskCreate(BaseModel):
    project_id: int = 1
    task_code: str = Field(min_length=1, max_length=40)
    name: str = Field(min_length=1, max_length=180)
    phase: str = Field(default="General", max_length=80)
    due_date: date | None = None
    progress: float = Field(default=0, ge=0, le=100)
    status: str = Field(default="Not started", max_length=30)
    notes: str | None = None


class ExpenseCreate(BaseModel):
    project_id: int = 1
    category: str = Field(min_length=1, max_length=100)
    description: str = Field(min_length=1, max_length=200)
    amount: float = Field(gt=0)
    expense_date: date | None = None
    vendor: str | None = None
    status: str = Field(default="Recorded", max_length=30)


class ProgressUpdateCreate(BaseModel):
    project_id: int = 1
    update_date: date
    planned_progress: float = Field(ge=0, le=100)
    actual_progress: float = Field(ge=0, le=100)
    summary: str = Field(min_length=1, max_length=300)
    blockers: str | None = None


class RiskCreate(BaseModel):
    project_id: int = 1
    title: str = Field(min_length=1, max_length=180)
    description: str | None = None
    probability: str = Field(default="Medium", max_length=20)
    impact: str = Field(default="Medium", max_length=20)
    mitigation: str | None = None
    status: str = Field(default="Open", max_length=30)


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


# Tasks and schedule
@app.get("/tasks")
def list_tasks(project_id: int = 1, db: Session = Depends(get_db)):
    return [vars_row(x) for x in db.query(models.Task).filter(models.Task.project_id == project_id).order_by(models.Task.id.desc()).all()]

@app.post("/tasks", status_code=201)
def create_task(data: TaskCreate, db: Session = Depends(get_db)):
    if not db.query(models.Project).filter(models.Project.id == data.project_id).first():
        raise HTTPException(status_code=404, detail="Project not found")
    if db.query(models.Task).filter(models.Task.task_code == data.task_code).first():
        raise HTTPException(status_code=409, detail="Task code already exists")
    item = models.Task(**data.model_dump())
    db.add(item); db.commit(); db.refresh(item)
    return vars_row(item)

@app.patch("/tasks/{task_id}")
def update_task(task_id: int, data: dict, db: Session = Depends(get_db)):
    item = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not item: raise HTTPException(status_code=404, detail="Task not found")
    allowed = {"name", "phase", "due_date", "progress", "status", "notes"}
    for key, value in data.items():
        if key in allowed: setattr(item, key, value)
    db.commit(); db.refresh(item)
    return vars_row(item)

@app.delete("/tasks/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    item = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not item: raise HTTPException(status_code=404, detail="Task not found")
    db.delete(item); db.commit()

# Expenses
@app.get("/expenses")
def list_expenses(project_id: int = 1, db: Session = Depends(get_db)):
    return [vars_row(x) for x in db.query(models.Expense).filter(models.Expense.project_id == project_id).order_by(models.Expense.id.desc()).all()]

@app.post("/expenses", status_code=201)
def create_expense(data: ExpenseCreate, db: Session = Depends(get_db)):
    if not db.query(models.Project).filter(models.Project.id == data.project_id).first():
        raise HTTPException(status_code=404, detail="Project not found")
    item = models.Expense(**data.model_dump())
    db.add(item); db.commit(); db.refresh(item)
    project = db.query(models.Project).filter(models.Project.id == data.project_id).first()
    project.recorded_cost = (project.recorded_cost or 0) + data.amount
    db.commit()
    return vars_row(item)

# Progress log
@app.get("/progress-updates")
def list_progress_updates(project_id: int = 1, db: Session = Depends(get_db)):
    return [vars_row(x) for x in db.query(models.ProgressUpdate).filter(models.ProgressUpdate.project_id == project_id).order_by(models.ProgressUpdate.update_date.desc(), models.ProgressUpdate.id.desc()).all()]

@app.post("/progress-updates", status_code=201)
def create_progress_update(data: ProgressUpdateCreate, db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.id == data.project_id).first()
    if not project: raise HTTPException(status_code=404, detail="Project not found")
    item = models.ProgressUpdate(**data.model_dump())
    project.planned_progress = data.planned_progress
    project.actual_progress = data.actual_progress
    db.add(item); db.commit(); db.refresh(item)
    return vars_row(item)

# Risk register
@app.get("/risks")
def list_risks(project_id: int = 1, db: Session = Depends(get_db)):
    return [vars_row(x) for x in db.query(models.Risk).filter(models.Risk.project_id == project_id).order_by(models.Risk.id.desc()).all()]

@app.post("/risks", status_code=201)
def create_risk(data: RiskCreate, db: Session = Depends(get_db)):
    if not db.query(models.Project).filter(models.Project.id == data.project_id).first():
        raise HTTPException(status_code=404, detail="Project not found")
    item = models.Risk(**data.model_dump())
    db.add(item); db.commit(); db.refresh(item)
    return vars_row(item)

@app.patch("/risks/{risk_id}")
def update_risk(risk_id: int, data: dict, db: Session = Depends(get_db)):
    item = db.query(models.Risk).filter(models.Risk.id == risk_id).first()
    if not item: raise HTTPException(status_code=404, detail="Risk not found")
    allowed = {"title", "description", "probability", "impact", "mitigation", "status"}
    for key, value in data.items():
        if key in allowed: setattr(item, key, value)
    db.commit(); db.refresh(item)
    return vars_row(item)

# Summary endpoint for dashboards and reports
@app.get("/summary")
def summary(project_id: int = 1, db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project: raise HTTPException(status_code=404, detail="Project not found")
    expenses = db.query(models.Expense).filter(models.Expense.project_id == project_id).all()
    tasks = db.query(models.Task).filter(models.Task.project_id == project_id).all()
    risks = db.query(models.Risk).filter(models.Risk.project_id == project_id, models.Risk.status != "Closed").all()
    ev = project.approved_budget * (project.actual_progress / 100)
    ac = project.recorded_cost
    pv = project.approved_budget * (project.planned_progress / 100)
    return {"project_id": project.id, "approved_budget": project.approved_budget, "recorded_cost": ac,
            "budget_remaining": project.approved_budget - ac, "planned_progress": project.planned_progress,
            "actual_progress": project.actual_progress, "schedule_variance_pp": project.actual_progress - project.planned_progress,
            "earned_value": round(ev, 2), "planned_value": round(pv, 2), "cost_variance": round(ev - ac, 2),
            "cost_performance_index": round(ev / ac, 3) if ac else None,
            "estimate_at_completion": round(project.approved_budget / (ev / ac), 2) if ev and ac else None,
            "task_count": len(tasks), "open_risk_count": len(risks), "expense_count": len(expenses),
            "expense_total": round(sum(e.amount for e in expenses), 2)}

def vars_row(item):
    return {column.name: getattr(item, column.name) for column in item.__table__.columns}
