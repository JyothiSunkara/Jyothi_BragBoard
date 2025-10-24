# shoutouts.py
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List, Optional
from datetime import datetime, timedelta
import shutil, uuid, os

from database import get_db
from database_models import ShoutOut, User, ShoutOutTag
from auth import get_current_user
from schemas import UserOut, ShoutOutCreate, ShoutOutResponse, VisibilityEnum

router = APIRouter(prefix="/shoutouts", tags=["shoutouts"])

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# -------------------- UPLOAD IMAGE --------------------
@router.post("/upload-image")
async def upload_image(image: UploadFile = File(...)):
    ext = image.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)
    return {"image_url": f"/{UPLOAD_FOLDER}/{filename}"}


# -------------------- CREATE SHOUTOUT --------------------
@router.post("/create", response_model=ShoutOutResponse)
def create_shoutout(
    shoutout: ShoutOutCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    receiver = db.query(User).filter(User.id == shoutout.receiver_id).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found")
    
    title = shoutout.title.strip() if shoutout.title else f"Shoutout from {current_user.username}"

    new_shoutout = ShoutOut(
        title=title,
        message=shoutout.message,
        giver_id=current_user.id,
        receiver_id=shoutout.receiver_id,
        giver_department=current_user.department,
        receiver_department=receiver.department,
        category=shoutout.category,
        is_public=shoutout.is_public,
        image_url=shoutout.image_url,
        created_at=datetime.utcnow()
    )
    db.add(new_shoutout)
    db.commit()
    db.refresh(new_shoutout)

    # Handle tagged users
    tagged_users_objs = []
    for uid in shoutout.tagged_user_ids or []:
        tagged_user = db.query(User).filter(User.id == uid).first()
        if tagged_user:
            tag = ShoutOutTag(shoutout_id=new_shoutout.id, tagged_user_id=uid)
            db.add(tag)
            tagged_users_objs.append(tagged_user)
    db.commit()

    return ShoutOutResponse(
        id=new_shoutout.id,
        giver_id=new_shoutout.giver_id,
        receiver_id=new_shoutout.receiver_id,
        title=new_shoutout.title,
        message=new_shoutout.message,
        giver_name=current_user.username,
        receiver_name=receiver.username,
        giver_department=current_user.department,
        giver_role=current_user.role,
        receiver_department=receiver.department,
        receiver_role=receiver.role,
        tagged_users=[UserOut.model_validate(u) for u in tagged_users_objs],
        category=new_shoutout.category,
        is_public=new_shoutout.is_public,
        created_at=new_shoutout.created_at,
        image_url=new_shoutout.image_url
    )


# -------------------- FEED --------------------
@router.get("/feed", response_model=List[ShoutOutResponse])
def get_shoutouts_feed(
    department: Optional[str] = Query("all"),
    sender_id: Optional[int] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(ShoutOut)

    # Department filter
    if department != "all":
        query = query.filter(
            or_(ShoutOut.giver_department == department,
                ShoutOut.receiver_department == department)
        )
    # Sender filter
    if sender_id:
        query = query.filter(ShoutOut.giver_id == sender_id)
    # Date filters
    if date_from:
        query = query.filter(ShoutOut.created_at >= date_from)
    if date_to:
        query = query.filter(ShoutOut.created_at <= date_to)
    # Search filter
    if search:
        query = query.filter(ShoutOut.message.ilike(f"%{search}%"))

    shoutouts = query.order_by(ShoutOut.created_at.desc()).offset(skip).limit(limit).all()

    results = []
    for s in shoutouts:
        # Visibility filter
        if (
            s.is_public == VisibilityEnum.public
            or s.giver_id == current_user.id
            or s.receiver_id == current_user.id
            or (s.is_public == VisibilityEnum.department_only and (
                s.giver_department == current_user.department
                or s.receiver_department == current_user.department
            ))
        ):
            tagged_users = [UserOut.model_validate(t.tagged_user) for t in s.tags]
            results.append(ShoutOutResponse(
                id=s.id,
                giver_id=s.giver_id,          
                receiver_id=s.receiver_id,
                title=s.title,
                message=s.message,
                giver_name=s.giver.username,
                receiver_name=s.receiver.username,
                giver_department=s.giver.department,
                receiver_department=s.receiver.department,
                giver_role=s.giver.role,
                receiver_role=s.receiver.role,
                tagged_users=tagged_users,
                category=s.category,
                is_public=s.is_public,
                created_at=s.created_at,
                image_url=s.image_url
            ))
    return results


# -------------------- MY SHOUTOUTS --------------------
@router.get("/my-shoutouts", response_model=dict)
def get_my_shoutouts(
    receiver_department: Optional[str] = Query("all"),
    days: Optional[int] = Query(None),  # for time filter
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(ShoutOut).filter(
        or_(
            ShoutOut.giver_id == current_user.id,
            ShoutOut.receiver_id == current_user.id
        )
    )

    if receiver_department != "all":
        query = query.filter(ShoutOut.receiver_department == receiver_department)

    if days is not None:
        cutoff = datetime.utcnow() - timedelta(days=days)
        query = query.filter(ShoutOut.created_at >= cutoff)

    shoutouts = query.order_by(ShoutOut.created_at.desc()).all()

    result = []
    for s in shoutouts:
        tagged_users = [UserOut.model_validate(t.tagged_user) for t in s.tags]
        result.append({
            "id": s.id,
            "title": s.title,
            "message": s.message,
            "giver_id": s.giver_id,
            "giver_name": s.giver.username,
            "giver_department": s.giver.department,
            "giver_role": s.giver.role,
            "receiver_id": s.receiver_id,
            "receiver_name": s.receiver.username,
            "receiver_department": s.receiver.department,
            "receiver_role": s.receiver.role,
            "category": s.category,
            "is_public": s.is_public,
            "created_at": s.created_at,
            "image_url": s.image_url,
            "tagged_users": tagged_users
        })

    return {
        "total": len(shoutouts),
        "sent": sum(1 for s in shoutouts if s.giver_id == current_user.id),
        "received": sum(1 for s in shoutouts if s.receiver_id == current_user.id),
        "shoutouts": result
    }

# -------------------- DASHBOARD STATS --------------------
@router.get("/dashboard/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total_users = db.query(User).filter(User.department == current_user.department).count()
    shoutouts_sent = db.query(ShoutOut).filter(ShoutOut.giver_id == current_user.id).count()
    shoutouts_received = db.query(ShoutOut).filter(ShoutOut.receiver_id == current_user.id).count()

    return {
        "totalUsers": total_users,
        "shoutoutsSent": shoutouts_sent,
        "shoutoutsReceived": shoutouts_received
    }


# -------------------- SEARCH USERS --------------------
@router.get("/users/search", response_model=List[UserOut])
def search_users_by_department(
    department: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(User).filter(User.id != current_user.id)
    if department and department != "all":
        query = query.filter(User.department == department)
    if search:
        query = query.filter(User.username.ilike(f"%{search}%"))
    users = query.limit(20).all()

    return [UserOut.model_validate(user) for user in users]
