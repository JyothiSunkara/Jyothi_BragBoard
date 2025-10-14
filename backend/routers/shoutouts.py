from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
from database import get_db
from database_models import ShoutOut, User, ShoutOutTag
from auth import get_current_user
from schemas import UserOut, ShoutOutCreate, ShoutOutResponse, DepartmentStats
from utils import utc_to_ist  

router = APIRouter(prefix="/shoutouts", tags=["shoutouts"])

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
        is_public=shoutout.is_public
    )
    db.add(new_shoutout)
    db.commit()
    db.refresh(new_shoutout)

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
        giver_department=new_shoutout.giver_department,
        receiver_department=new_shoutout.receiver_department,
        tagged_users=[UserOut.from_attributes(user) for user in tagged_users_objs],
        category=new_shoutout.category,
        is_public=new_shoutout.is_public,
        created_at=utc_to_ist(new_shoutout.created_at)
    )

# -------------------- FEED --------------------
@router.get("/feed", response_model=List[ShoutOutResponse])
def get_shoutouts_feed(
    department: Optional[str] = Query(None, description="Filter by department. Use 'all' for all departments"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(ShoutOut)

    if department and department != "all":
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

    for shoutout in shoutouts:
        giver = shoutout.giver
        receiver = shoutout.receiver
        tagged_users = [UserOut.from_attributes(tag.tagged_user) for tag in shoutout.tags]

        result.append(ShoutOutResponse(
            id=shoutout.id,
            title=shoutout.title,
            message=shoutout.message,
            giver_name=giver.username,
            receiver_name=receiver.username,
            giver_department=shoutout.giver_department,
            receiver_department=shoutout.receiver_department,
            tagged_users=tagged_users,
            category=shoutout.category,
            is_public=shoutout.is_public,
            created_at=utc_to_ist(shoutout.created_at)
        ))

    return result

# -------------------- MY SHOUTOUTS --------------------
@router.get("/my-shoutouts", response_model=List[ShoutOutResponse])
def get_my_shoutouts(
    type: str = Query("all", description="'given', 'received', or 'all'"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(ShoutOut)

    if type == "given":
        query = query.filter(ShoutOut.giver_id == current_user.id)
    elif type == "received":
        query = query.filter(ShoutOut.receiver_id == current_user.id)
    else:
        query = query.filter(
            or_(
                ShoutOut.giver_id == current_user.id,
                ShoutOut.receiver_id == current_user.id
            )
        )

    shoutouts = query.order_by(ShoutOut.created_at.desc()).offset(skip).limit(limit).all()
    result = []

    for shoutout in shoutouts:
        giver = shoutout.giver
        receiver = shoutout.receiver
        tagged_users = [UserOut.from_attributes(tag.tagged_user) for tag in shoutout.tags]

        result.append(ShoutOutResponse(
            id=shoutout.id,
            title=shoutout.title,
            message=shoutout.message,
            giver_name=giver.username,
            receiver_name=receiver.username,
            giver_department=shoutout.giver_department,
            receiver_department=shoutout.receiver_department,
            tagged_users=tagged_users,
            category=shoutout.category,
            is_public=shoutout.is_public,
            created_at=utc_to_ist(shoutout.created_at)
        ))

    return result

# -------------------- DEPARTMENT STATS --------------------
@router.get("/departments/stats", response_model=List[DepartmentStats])
def get_department_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    departments = db.query(User.department).distinct().all()
    department_list = [dept[0] for dept in departments]
    stats = []

    for dept in department_list:
        total = db.query(ShoutOut).filter(
            or_(
                ShoutOut.giver_department == dept,
                ShoutOut.receiver_department == dept
            )
        ).count()
        given = db.query(ShoutOut).filter(ShoutOut.giver_department == dept).count()
        received = db.query(ShoutOut).filter(ShoutOut.receiver_department == dept).count()

        stats.append(DepartmentStats(
            department=dept,
            total_shoutouts=total,
            shoutouts_given=given,
            shoutouts_received=received
        ))

    return sorted(stats, key=lambda x: x.total_shoutouts, reverse=True)

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

    return [UserOut.from_attributes(user) for user in users]
