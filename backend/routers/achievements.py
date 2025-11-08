from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from database_models import User, ShoutOut
from auth import get_current_user
from sqlalchemy import func
from datetime import datetime, timedelta
from database_models import User, ShoutOut, ShoutOutReaction, Comment,ShoutOutTag

router = APIRouter(prefix="/achievements", tags=["Achievements"])

# -------------------- USER ACHIEVEMENTS --------------------
@router.get("/", response_model=dict)
def get_user_achievements(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Returns achievements for the logged-in user
    """

    # Shoutouts sent
    sent_count = db.query(ShoutOut).filter(
        ShoutOut.giver_id == current_user.id,
        ShoutOut.is_deleted == False
    ).count()

    # Shoutouts received
    received_count = db.query(ShoutOut).filter(
        ShoutOut.receiver_id == current_user.id,
        ShoutOut.is_deleted == False
    ).count()

    # Reactions given
    reactions_given = db.query(ShoutOutReaction).filter(
      ShoutOutReaction.user_id == current_user.id
    ).count()


    # Reactions received
    reactions_received = db.query(ShoutOutReaction).join(ShoutOut).filter(
      ShoutOut.receiver_id == current_user.id
    ).count()

    # Comments given & received can be added similarly if you have a Comment model

    # Tagged shoutouts
    tagged_count = db.query(ShoutOutTag).filter(
        ShoutOutTag.tagged_user_id == current_user.id
    ).count()

    # Monthly sent
    month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    monthly_sent = db.query(ShoutOut).filter(
        ShoutOut.giver_id == current_user.id,
        ShoutOut.is_deleted == False,
        ShoutOut.created_at >= month_start
    ).count()

    achievements = [
        {"title": "Shoutouts Sent", "count": sent_count, "badge": "✉️", "label": "shoutout", "given": sent_count, "received": received_count, "milestone": 5},
        {"title": "Tagged in Shoutouts", "count": tagged_count, "badge": "🏷️", "label": "tagged shoutout", "given": tagged_count, "received": 0, "milestone": 5},
        {"title": "Monthly Contributor", "count": monthly_sent, "badge": "🏆", "label": "shoutout", "given": monthly_sent, "received": received_count, "milestone": 5},
        {"title": "Reactions Given", "count": reactions_given, "badge": "👏", "label": "reaction", "given": reactions_given, "received": 0, "milestone": 10},
        {"title": "Reactions Received", "count": reactions_received, "badge": "💌", "label": "reaction", "given": 0, "received": reactions_received, "milestone": 10},
    ]

    return {"user": current_user.username, "achievements": achievements}

# -------------------- LEADERBOARD --------------------
@router.get("/leaderboard", response_model=dict)
def get_leaderboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user), top_n: int = 10):
    """
    Returns top contributors in user's department and company-wide leaderboard
    """
    # Top users globally
    top_users = db.query(
        User.username,
        func.count(ShoutOut.id).label("shoutouts_sent")
    ).join(ShoutOut, ShoutOut.giver_id == User.id).filter(
        ShoutOut.is_deleted == False
    ).group_by(User.id).order_by(func.count(ShoutOut.id).desc()).limit(top_n).all()

    # Top users in user's department
    top_department_users = db.query(
        User.username,
        func.count(ShoutOut.id).label("shoutouts_sent")
    ).join(ShoutOut, ShoutOut.giver_id == User.id).filter(
        User.department == current_user.department,
        ShoutOut.is_deleted == False
    ).group_by(User.id).order_by(func.count(ShoutOut.id).desc()).limit(top_n).all()

    # Top departments by total shoutouts
    top_departments = db.query(
        ShoutOut.receiver_department,
        func.count(ShoutOut.id).label("shoutout_count")
    ).filter(ShoutOut.is_deleted == False
    ).group_by(ShoutOut.receiver_department
    ).order_by(func.count(ShoutOut.id).desc()
    ).limit(top_n).all()

    return {
        "top_users_global": [{"username": u.username, "shoutouts_sent": u.shoutouts_sent} for u in top_users],
        "top_users_department": [{"username": u.username, "shoutouts_sent": u.shoutouts_sent} for u in top_department_users],
        "top_departments": [{"department": d.receiver_department, "shoutout_count": d.shoutout_count} for d in top_departments]
    }
