import os
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlalchemy import Column, DateTime, Integer, String, Text, create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker

SECRET_KEY = "ZF_CAI_CYBER_TELEMETRY_SECRET_KEY"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480

DATABASE_URL = "sqlite:///./telemetry.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/admin/login")

# DB Models
class ContentDB(Base):
    __tablename__ = "lab_content"
    id = Column(Integer, primary_key=True, index=True)
    hero_title = Column(String, default="Autonomous & E-Mobility Testbed")
    can_bus_speed = Column(String, default="500 KBPS")
    active_projects = Column(String, default="50+")
    publications = Column(String, default="20+")
    collaborations = Column(String, default="15+")
    test_bench_status = Column(String, default="24/7 ONLINE")

class ProjectDB(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    project_code = Column(String, unique=True, index=True)
    title = Column(String)
    lead = Column(String)
    description = Column(Text)
    tech_tags = Column(String)

class TransmissionDB(Base):
    __tablename__ = "transmissions"
    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(String)
    return_address = Column(String)
    encrypted_payload = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

# Schemas
class ContentSchema(BaseModel):
    hero_title: str
    can_bus_speed: str
    active_projects: str
    publications: str
    collaborations: str
    test_bench_status: str
    class Config:
        from_attributes = True

class ProjectSchema(BaseModel):
    project_code: str
    title: str
    lead: str
    description: str
    tech_tags: str
    class Config:
        from_attributes = True

class TransmissionCreate(BaseModel):
    subject_id: str
    return_address: str
    encrypted_payload: str

class TransmissionSchema(TransmissionCreate):
    id: int
    timestamp: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

app = FastAPI(title="ZF CAI Telematics API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.on_event("startup")
def seed_data():
    db = SessionLocal()
    if not db.query(ContentDB).first():
        db.add(ContentDB(id=1))
    if db.query(ProjectDB).count() == 0:
        db.add_all([
            ProjectDB(
                project_code="01: PROJ-001",
                title="BMS Real-Time Thermal Estimator",
                lead="Dr. Elena Rostova",
                description="High-frequency state-of-charge edge estimation pipeline executing over ISO 26262 ASIL-D compliant CAN nodes.",
                tech_tags="PyTorch,C++,CANopen,RTLAB"
            ),
            ProjectDB(
                project_code="02: PROJ-002",
                title="Drive-by-Wire Steering Gateway",
                lead="Marcus Vance",
                description="Sub-millisecond fail-operational steer-by-wire controller with physical layer fault injection telemetry.",
                tech_tags="Simulink,AUTOSAR,FPGA,Rust"
            )
        ])
    db.commit()
    db.close()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username != "zf_operator":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid identity")
        return username
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired or corrupt")

# Frontend Static File Routes
@app.get("/")
def serve_frontend():
    html_path = Path(__file__).resolve().parent.parent / "frontend" / "code.html"
    if not html_path.exists():
        raise HTTPException(status_code=404, detail=f"code.html not found at {html_path}")
    return FileResponse(html_path)

@app.get("/admin")
def serve_admin():
    html_path = Path(__file__).resolve().parent.parent / "frontend" / "admin.html"
    if not html_path.exists():
        raise HTTPException(status_code=404, detail=f"admin.html not found at {html_path}")
    return FileResponse(html_path)

# Public Endpoints
@app.get("/api/v1/content", response_model=ContentSchema)
def read_content(db: Session = Depends(get_db)):
    return db.query(ContentDB).first()

@app.get("/api/v1/projects", response_model=List[ProjectSchema])
def list_projects(db: Session = Depends(get_db)):
    return db.query(ProjectDB).all()

@app.post("/api/v1/transmissions", status_code=201)
def submit_transmission(tx: TransmissionCreate, db: Session = Depends(get_db)):
    new_tx = TransmissionDB(**tx.model_dump())
    db.add(new_tx)
    db.commit()
    return {"status": "ACK", "message": "Payload ingested to mission control queue."}

# Admin & Operator Endpoints
@app.post("/api/v1/admin/login", response_model=Token)
def admin_login(form_data: OAuth2PasswordRequestForm = Depends()):
    if form_data.username == "zf_operator" and form_data.password == "telemetry@2026":
        token = create_access_token(
            data={"sub": form_data.username},
            expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        return {"access_token": token, "token_type": "bearer"}
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid tactical credentials")

@app.post("/api/v1/admin/projects", response_model=ProjectSchema)
def create_project(proj: ProjectSchema, db: Session = Depends(get_db), _: str = Depends(verify_token)):
    p = ProjectDB(**proj.model_dump())
    db.add(p)
    db.commit()
    db.refresh(p)
    return p

@app.get("/api/v1/admin/transmissions", response_model=List[TransmissionSchema])
def get_transmissions(db: Session = Depends(get_db), _: str = Depends(verify_token)):
    return db.query(TransmissionDB).order_by(TransmissionDB.timestamp.desc()).all()