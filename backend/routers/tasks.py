from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas
from routers.auth import get_current_user, get_current_admin

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.get("/", response_model=List[schemas.TaskResponse])
def get_all_tasks(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role == models.RoleEnum.admin:
        return db.query(models.Task).all()
    return db.query(models.Task).filter(models.Task.assignee_id == current_user.id).all()

@router.post("/project/{project_id}", response_model=schemas.TaskResponse)
def create_task(project_id: int, task: schemas.TaskCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db_task = models.Task(**task.model_dump(), project_id=project_id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.put("/{task_id}", response_model=schemas.TaskResponse)
def update_task_status(task_id: int, status: schemas.StatusEnum, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if current_user.role != models.RoleEnum.admin and task.assignee_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this task")
    task.status = status
    db.commit()
    db.refresh(task)
    return task
