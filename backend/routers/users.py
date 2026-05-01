from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas
from routers.auth import get_current_user

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/", response_model=List[schemas.UserResponse])
def get_users(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.User).all()
