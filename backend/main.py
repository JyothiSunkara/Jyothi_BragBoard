
from fastapi import FastAPI, Depends
from database import engine, get_db
from routers import users, shoutouts, reactions,comments, admin, achievements
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database_models import Base
from fastapi.staticfiles import StaticFiles

Base.metadata.create_all(bind=engine)

app = FastAPI(title="BragBoard API", version="1.0.0")

# origins = ["http://localhost:3000"]
# origins = ["https://bragboard-frontend.vercel.app"]
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://bragboard-frontend.vercel.app",
    "https://bragboard-frontend-loxwr876e-jyothisunkaras-projects.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Yes Done"}

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    try:
        from sqlalchemy import text
        db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": str(e)}

# app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(users.router)
app.include_router(shoutouts.router)
app.include_router(reactions.router)
app.include_router(comments.router)
app.include_router(admin.router)
app.include_router(achievements.router)


