from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
from datetime import datetime
import shutil, uuid, os

from database import get_db
from database_models import ShoutOut, User, ShoutOutTag
from auth import get_current_user
from schemas import UserOut, ShoutOutCreate, ShoutOutResponse, DepartmentStats

router = APIRouter(prefix="/shoutouts", tags=["shoutouts"])

# Ensure uploads folder exists
UPLOAD_FOLDER = "uploads"
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


# -------------------- UPLOAD IMAGE --------------------
@router.post("/upload-image")
async def upload_image(image: UploadFile = File(...)):
    try:
        ext = image.filename.split(".")[-1]
        filename = f"{uuid.uuid4()}.{ext}"
        file_path = os.path.join(UPLOAD_FOLDER, filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

        return {"image_url": f"/{UPLOAD_FOLDER}/{filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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

    new_shoutout = ShoutOut(
        title=shoutout.title,
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
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(ShoutOut)

    # Filter by department / public visibility
    if department != "all":
        query = query.filter(
            or_(
                ShoutOut.giver_department == department,
                ShoutOut.receiver_department == department
            )
        )
        if current_user.department == department or current_user.role == "admin":
            query = query.filter(ShoutOut.is_public.in_(["public", "department_only"]))
        else:
            query = query.filter(ShoutOut.is_public == "public")
    else:
        if current_user.role == "admin":
            query = query.filter(ShoutOut.is_public.in_(["public", "department_only"]))
        else:
            query = query.filter(
                or_(
                    ShoutOut.is_public == "public",
                    and_(
                        ShoutOut.is_public == "department_only",
                        or_(
                            ShoutOut.giver_department == current_user.department,
                            ShoutOut.receiver_department == current_user.department
                        )
                    )
                )
            )

    shoutouts = query.order_by(ShoutOut.created_at.desc()).offset(skip).limit(limit).all()
    result = []

    for s in shoutouts:
        tagged_users = [UserOut.model_validate(tag.tagged_user) for tag in s.tags]

        result.append(ShoutOutResponse(
            id=s.id,
            title=s.title,
            message=s.message,
            giver_name=s.giver.username if s.giver else "N/A",
            receiver_name=s.receiver.username if s.receiver else "N/A",
            giver_department=s.giver.department if s.giver else "N/A",
            giver_role=s.giver.role if s.giver else "N/A",
            receiver_department=s.receiver.department if s.receiver else "N/A",
            receiver_role=s.receiver.role if s.receiver else "N/A",
            tagged_users=tagged_users,
            category=s.category,
            is_public=s.is_public,
            created_at=s.created_at,
            image_url=s.image_url
        ))

    return result


# -------------------- DASHBOARD STATS FOR CURRENT USER --------------------
@router.get("/dashboard/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Total users in the same department
    total_users = db.query(User).filter(User.department == current_user.department).count()

    # Shoutouts sent by this user
    shoutouts_sent = db.query(ShoutOut).filter(ShoutOut.giver_id == current_user.id).count()

    # Shoutouts received by this user
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
