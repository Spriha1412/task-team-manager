from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from models import RoleEnum, StatusEnum

class UserBase(BaseModel):
    username: str
    role: Optional[RoleEnum] = RoleEnum.member

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: Optional[StatusEnum] = StatusEnum.todo
    due_date: Optional[datetime] = None
    assignee_id: Optional[int] = None

class TaskCreate(TaskBase):
    pass

class TaskResponse(TaskBase):
    id: int
    project_id: int
    class Config:
        from_attributes = True

class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: int
    owner_id: int
    tasks: List[TaskResponse] = []
    class Config:
        from_attributes = True
