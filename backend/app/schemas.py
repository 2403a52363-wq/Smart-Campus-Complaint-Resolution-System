
from pydantic import BaseModel, EmailStr
from typing import Optional


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str
    department: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str
    department: Optional[str] = None

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class ComplaintCreate(BaseModel):
    student_id: int
    title: str
    description: str
    category: str
    priority: str = "Medium"


class FeedbackCreate(BaseModel):
    complaint_id: int
    student_id: int
    rating: int
    comments: str = ""


class ComplaintStatusUpdate(BaseModel):
    status: str


class AssignmentCreate(BaseModel):
    complaint_id: int
    staff_id: int
    assigned_by: int
