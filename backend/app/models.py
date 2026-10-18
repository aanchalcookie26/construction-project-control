
from sqlalchemy import Column, Date, Float, Integer, String
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
