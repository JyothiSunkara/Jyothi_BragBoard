from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from datetime import datetime
from auth import get_current_user
from database import get_db
from database_models import ShoutOut, ShoutOutReaction, User
from schemas import AddReactionRequest, ReactionResponse

router = APIRouter(prefix="/reactions", tags=["Reactions"])


# -------------------------------------------------------
#  Add / Update / Remove Reaction (Toggle System)
# -------------------------------------------------------
@router.post("/{shoutout_id}")
def add_or_update_reaction(
    shoutout_id: int,
    request: AddReactionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Check if shoutout exists
    shoutout = db.query(ShoutOut).filter(ShoutOut.id == shoutout_id).first()
    if not shoutout:
        raise HTTPException(status_code=404, detail="ShoutOut not found.")

    # Check if user already reacted
    existing_reaction = db.query(ShoutOutReaction).filter(
        and_(
            ShoutOutReaction.shoutout_id == shoutout_id,
            ShoutOutReaction.user_id == current_user.id
        )
    ).first()

    if existing_reaction:
        # ✅ If same emoji clicked → remove reaction (toggle)
        if existing_reaction.reaction_type == request.reaction_type:
            db.delete(existing_reaction)
            db.commit()
            return {"message": "Reaction removed."}

        # ✅ If different emoji clicked → update reaction
        existing_reaction.reaction_type = request.reaction_type
        existing_reaction.created_at = datetime.utcnow()

    else:
        # ✅ Add new reaction
        new_reaction = ShoutOutReaction(
            shoutout_id=shoutout_id,
            user_id=current_user.id,
            reaction_type=request.reaction_type,
            created_at=datetime.utcnow()
        )
        db.add(new_reaction)

    db.commit()
    return {"message": "Reaction added/updated successfully."}


# -------------------------------------------------------
#  Get Reaction Counts + user’s reaction for a shoutout
#  Returns:
#  {
#    "like": 3,
#    "love": 1,
#    "clap": 5,
#    "celebrate": 0,
#    "insightful": 2,
#    "support": 1,
#    "my_reaction": "clap"
#  }
# -------------------------------------------------------
@router.get("/{shoutout_id}")
def get_reaction_counts(
    shoutout_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Count reactions grouped by reaction_type
    counts = db.query(
        ShoutOutReaction.reaction_type,
        func.count(ShoutOutReaction.id)
    ).filter(
        ShoutOutReaction.shoutout_id == shoutout_id
    ).group_by(
        ShoutOutReaction.reaction_type
    ).all()

    # Convert to dictionary
    reaction_data = {rtype: count for rtype, count in counts}

    # Make sure all reaction types exist (even if 0)
    all_types = ["like", "love", "clap", "celebrate", "insightful", "support", "star"]
    for t in all_types:
        reaction_data.setdefault(t, 0)

    # Get current user's reaction if exists
    my_reaction = db.query(ShoutOutReaction).filter(
        ShoutOutReaction.shoutout_id == shoutout_id,
        ShoutOutReaction.user_id == current_user.id
    ).first()

    reaction_data["my_reaction"] = my_reaction.reaction_type if my_reaction else None

    return reaction_data
