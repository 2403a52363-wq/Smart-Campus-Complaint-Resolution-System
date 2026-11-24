
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app import models

from fastapi import Depends, HTTPException, Header
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import UserCreate, UserResponse, UserLogin, ComplaintCreate, FeedbackCreate, ComplaintStatusUpdate, AssignmentCreate
from app.models import User, Complaint, Feedback, Assignment
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
import os


import hashlib
import secrets
def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    derived_key = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        600_000
    )
    return f"{salt.hex()}${derived_key.hex()}"
def verify_password(password: str, stored_hash: str) -> bool:
    salt_hex, hash_hex = stored_hash.split("$", 1)
    salt = bytes.fromhex(salt_hex)
    expected = bytes.fromhex(hash_hex)

    actual = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        600_000
    )

    return secrets.compare_digest(actual, expected)


load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")

if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY not found in .env file")
security = HTTPBearer()

def create_access_token(user_id: int, role: str):
    expire = datetime.now(timezone.utc) + timedelta(minutes=60)

    token_data = {
        "sub": str(user_id),
        "role": role,
        "exp": expire
    }

    return jwt.encode(
        token_data,
        SECRET_KEY,
        algorithm="HS256"
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    try:
        token = credentials.credentials

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=["HS256"]
        )

        user_id = int(payload.get("sub"))

    except (JWTError, ValueError, TypeError):
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    current_user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not current_user:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    return current_user
def require_role(*allowed_roles):
    def role_checker(
        current_user: User = Depends(get_current_user)
    ):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail="You are not authorized to perform this action"
            )
        return current_user

    return role_checker
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Smart Campus Complaint System",
    description="Campus Complaint and Resolution API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://smart-campus-complaint-resolution-system.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
def home():
    return {
        "message": "Smart Campus Backend is Running!"
    }

@app.get("/health")
def health():
    return {
        "status": "OK"
    }
@app.post("/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    new_user = User(
        full_name=user.full_name,
        email=user.email,
        password_hash=hash_password(user.password),
        role=user.role,
        department=user.department
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user
@app.post("/login")
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if not existing_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(user.password, existing_user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        existing_user.id,
        existing_user.role
    )

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": existing_user.id,
        "full_name": existing_user.full_name,
        "email": existing_user.email,
        "role": existing_user.role
    }
@app.post("/complaints")
def create_complaint(
    complaint: ComplaintCreate,
    db: Session = Depends(get_db)
):
    new_complaint = Complaint(
        student_id=complaint.student_id,
        title=complaint.title,
        description=complaint.description,
        category=complaint.category,
        priority=complaint.priority
    )

    db.add(new_complaint)
    db.commit()
    db.refresh(new_complaint)

    return {
        "message": "Complaint submitted successfully",
        "complaint_id": new_complaint.id,
        "status": new_complaint.status
    }


@app.get("/complaints/{student_id}")
def get_student_complaints(
    student_id: int,
    db: Session = Depends(get_db)
):
    complaints = (
        db.query(Complaint)
        .filter(Complaint.student_id == student_id)
        .order_by(Complaint.created_at.desc())
        .all()
    )

    return [
        {
            "complaint_id": complaint.id,
            "title": complaint.title,
            "description": complaint.description,
            "category": complaint.category,
            "priority": complaint.priority,
            "status": complaint.status,
            "created_at": complaint.created_at
        }
        for complaint in complaints
    ]

@app.post("/feedback")
def submit_feedback(
    feedback: FeedbackCreate,
    db: Session = Depends(get_db)
):
    complaint = db.query(Complaint).filter(
        Complaint.id == feedback.complaint_id,
        Complaint.student_id == feedback.student_id
    ).first()

    if not complaint:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )

    if complaint.status != "Resolved":
        raise HTTPException(
            status_code=400,
            detail="Feedback can be submitted only for resolved complaints"
        )

    existing_feedback = db.query(Feedback).filter(
        Feedback.complaint_id == feedback.complaint_id
    ).first()

    if existing_feedback:
        raise HTTPException(
            status_code=400,
            detail="Feedback already submitted"
        )

    new_feedback = Feedback(
        complaint_id=feedback.complaint_id,
        student_id=feedback.student_id,
        rating=feedback.rating,
        comments=feedback.comments
    )

    db.add(new_feedback)
    db.commit()
    db.refresh(new_feedback)

    return {
        "message": "Feedback submitted successfully",
        "feedback_id": new_feedback.id
    }
@app.put("/complaints/{complaint_id}/status")
def update_complaint_status(
    complaint_id: int,
    status_data: ComplaintStatusUpdate,
    db: Session = Depends(get_db)
):
    complaint = db.query(Complaint).filter(
        Complaint.id == complaint_id
    ).first()

    if not complaint:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )

    if status_data.status not in ["Pending", "In Progress", "Resolved"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid complaint status"
        )

    complaint.status = status_data.status

    db.commit()
    db.refresh(complaint)

    return {
        "message": "Complaint status updated successfully",
        "complaint_id": complaint.id,
        "status": complaint.status
    }
@app.get("/admin/complaints")
@app.get("/admin/complaints")
def get_all_complaints(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin"))
):
    complaints = (
        db.query(Complaint)
        .order_by(Complaint.created_at.desc())
        .all()
    )

    return [
        {
            "complaint_id": complaint.id,
            "student_id": complaint.student_id,
            "title": complaint.title,
            "description": complaint.description,
            "category": complaint.category,
            "priority": complaint.priority,
            "status": complaint.status,
            "created_at": complaint.created_at
        }
        for complaint in complaints
    ]
@app.post("/admin/assign")
def assign_complaint(
    assignment: AssignmentCreate,
    db: Session = Depends(get_db)
):
    complaint = db.query(Complaint).filter(
        Complaint.id == assignment.complaint_id
    ).first()

    if not complaint:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )

    staff = db.query(User).filter(
        User.id == assignment.staff_id,
        User.role == "Staff"
    ).first()

    if not staff:
        raise HTTPException(
            status_code=404,
            detail="Staff not found"
        )

    new_assignment = Assignment(
        complaint_id=assignment.complaint_id,
        staff_id=assignment.staff_id,
        assigned_by=assignment.assigned_by
    )

    db.add(new_assignment)
    db.commit()
    db.refresh(new_assignment)

    return {
        "message": "Complaint assigned successfully",
        "assignment_id": new_assignment.id
    }
