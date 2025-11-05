from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from database_models import User, ShoutOut, ShoutOutTag, ShoutOutReport
from auth import get_current_user
from sqlalchemy import func

router = APIRouter(prefix="/admin", tags=["Admin"])

def admin_required(current_user: User):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


#  Top Contributors
@router.get("/top-contributors")
def top_contributors(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    admin_required(current_user)

    result = db.query(
        User.username,
        func.count(ShoutOut.id).label("sent_count")
    ).join(ShoutOut, ShoutOut.giver_id == User.id)\
     .group_by(User.id)\
     .order_by(func.count(ShoutOut.id).desc())\
     .limit(5).all()

    formatted = [{"username": r[0], "count": r[1]} for r in result]

    return formatted


#  Most Tagged Users
@router.get("/most-tagged")
def most_tagged(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    admin_required(current_user)

    result = db.query(
        User.username,
        func.count(ShoutOutTag.id).label("tag_count")
    ).join(ShoutOutTag, ShoutOutTag.tagged_user_id == User.id)\
     .group_by(User.id)\
     .order_by(func.count(ShoutOutTag.id).desc())\
     .limit(5).all()

    formatted = [{"username": r[0], "tag_count": r[1]} for r in result]

    return formatted


#  Get Reported Shoutouts
@router.get("/reports")
def get_reports(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    admin_required(current_user)

    results = (
        db.query(ShoutOutReport, ShoutOut, User)
        .join(ShoutOut, ShoutOut.id == ShoutOutReport.shoutout_id)
        .join(User, User.id == ShoutOut.giver_id)
        .filter(ShoutOutReport.status == "pending")
        .all()
    )

    response = []
    for report, shoutout, user in results:
        response.append({
            "report_id": report.id,
            "reason": report.reason,
            "shoutout_id": shoutout.id,
            "title": shoutout.title,
            "message": shoutout.message,
            "giver": user.username,
            "created_at": shoutout.created_at
        })

    return response


#  Resolve a Report
@router.put("/resolve/{report_id}")
def resolve_report(report_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    admin_required(current_user)

    report = db.query(ShoutOutReport).filter(ShoutOutReport.id == report_id).first()
    if not report:
        raise HTTPException(404, "Report not found")

    report.status = "resolved"
    db.commit()
    return {"message": "Report resolved"}


#  Admin Delete Shoutout
@router.delete("/shoutout/{shoutout_id}")
def admin_delete_shoutout(shoutout_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    admin_required(current_user)

    shout = db.query(ShoutOut).filter(ShoutOut.id == shoutout_id).first()
    if not shout:
        raise HTTPException(404, "Shoutout not found")

    shout.is_deleted = True
    db.commit()
    return {"message": "Shoutout deleted by admin"}
