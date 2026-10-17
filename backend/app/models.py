from sqlalchemy import Column, Date, Float, ForeignKey, Integer, String, Text
from .database import Base


class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    project_code = Column(String(50), unique=True, nullable=False)
    location = Column(String(150), nullable=False)
    approved_budget = Column(Float, nullable=False, default=0)
    recorded_cost = Column(Float, nullable=False, default=0)
    planned_progress = Column(Float, nullable=False, default=0)
    actual_progress = Column(Float, nullable=False, default=0)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    status = Column(String(30), nullable=False, default="Active")


class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, default=1)
    task_code = Column(String(40), nullable=False, unique=True)
    name = Column(String(180), nullable=False)
    phase = Column(String(80), nullable=False, default="General")
    due_date = Column(Date, nullable=True)
    progress = Column(Float, nullable=False, default=0)
    status = Column(String(30), nullable=False, default="Not started")
    notes = Column(Text, nullable=True)


class Expense(Base):
    __tablename__ = "expenses"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, default=1)
    category = Column(String(100), nullable=False)
    description = Column(String(200), nullable=False)
    amount = Column(Float, nullable=False)
    expense_date = Column(Date, nullable=True)
    vendor = Column(String(150), nullable=True)
    status = Column(String(30), nullable=False, default="Recorded")


class ProgressUpdate(Base):
    __tablename__ = "progress_updates"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, default=1)
    update_date = Column(Date, nullable=False)
    planned_progress = Column(Float, nullable=False, default=0)
    actual_progress = Column(Float, nullable=False, default=0)
    summary = Column(String(300), nullable=False)
    blockers = Column(Text, nullable=True)


class Risk(Base):
    __tablename__ = "risks"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, default=1)
    title = Column(String(180), nullable=False)
    description = Column(Text, nullable=True)
    probability = Column(String(20), nullable=False, default="Medium")
    impact = Column(String(20), nullable=False, default="Medium")
    mitigation = Column(Text, nullable=True)
    status = Column(String(30), nullable=False, default="Open")
