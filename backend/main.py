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

DB_PATH = Path(__file__).resolve().parent / "telemetry.db"
DATABASE_URL = f"sqlite:///{DB_PATH}"

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
    category = Column(String, default="Project")  # "Project", "Copyright", or "Patent"

class TransmissionDB(Base):
    __tablename__ = "transmissions"
    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(String)
    return_address = Column(String)
    encrypted_payload = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)

class AttendanceDB(Base):
    __tablename__ = "attendance_records"
    id = Column(Integer, primary_key=True, index=True)
    session_date = Column(String, index=True)
    slot_time = Column(String)
    topic_taught = Column(Text, default="")
    students_json = Column(Text, default="[]")
    updated_at = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

# Schemas
class ProjectSchema(BaseModel):
    id: Optional[int] = None
    project_code: str
    title: str
    lead: str
    description: str
    tech_tags: str
    category: str = "Project"

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

class AttendanceSchema(BaseModel):
    session_date: str
    slot_time: str
    topic_taught: str
    students_json: str

class Token(BaseModel):
    access_token: str
    token_type: str

app = FastAPI(title="ZF CAI Management & Telematics API", version="1.0.0")

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
                tech_tags="PyTorch,C++,CANopen,RTLAB",
                category="Project"
            ),
            ProjectDB(
                project_code="02: PAT-001",
                title="Drive-by-Wire Steer Torque Decoupler",
                lead="Marcus Vance",
                description="Sub-millisecond fail-operational steer-by-wire controller with physical layer fault injection telemetry.",
                tech_tags="Simulink,AUTOSAR,FPGA,Hardware IP",
                category="Patent"
            ),
            ProjectDB(
                project_code="03: CPR-001",
                title="CAN-Sec Real-Time Frame Validator Software",
                lead="Samira El-Amin",
                description="Registered algorithmic suite for lightweight symmetric payload verification across automotive ECUs.",
                tech_tags="Rust,CAN-FD,Cryptography",
                category="Copyright"
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
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid operator key")
        return username
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")

# Static File Endpoints
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
@app.get("/api/v1/projects", response_model=List[ProjectSchema])
def list_projects(db: Session = Depends(get_db)):
    return db.query(ProjectDB).all()

@app.post("/api/v1/transmissions", status_code=201)
def submit_transmission(tx: TransmissionCreate, db: Session = Depends(get_db)):
    new_tx = TransmissionDB(**tx.model_dump())
    db.add(new_tx)
    db.commit()
    return {"status": "ACK", "message": "Payload ingested to mission control queue."}

# Admin Endpoints
@app.post("/api/v1/admin/login", response_model=Token)
def admin_login(form_data: OAuth2PasswordRequestForm = Depends()):
    if form_data.username == "zf_operator" and form_data.password == "telemetry@2026":
        token = create_access_token(
            data={"sub": form_data.username},
            expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        return {"access_token": token, "token_type": "bearer"}
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid operator credentials")

@app.post("/api/v1/admin/projects", response_model=ProjectSchema)
def create_project(proj: ProjectSchema, db: Session = Depends(get_db), _: str = Depends(verify_token)):
    p = ProjectDB(**proj.model_dump(exclude={"id"}))
    db.add(p)
    db.commit()
    db.refresh(p)
    return p

@app.delete("/api/v1/admin/projects/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db), _: str = Depends(verify_token)):
    p = db.query(ProjectDB).filter(ProjectDB.id == project_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Project/IP record not found")
    db.delete(p)
    db.commit()
    return {"status": "SUCCESS", "message": f"Asset #{project_id} deleted."}

@app.get("/api/v1/admin/attendance")
def get_attendance(session_date: str, slot_time: str, db: Session = Depends(get_db), _: str = Depends(verify_token)):
    rec = db.query(AttendanceDB).filter(AttendanceDB.session_date == session_date, AttendanceDB.slot_time == slot_time).first()
    if not rec:
        return {"session_date": session_date, "slot_time": slot_time, "topic_taught": "", "students_json": "[]"}
    return rec

@app.post("/api/v1/admin/attendance")
def save_attendance(payload: AttendanceSchema, db: Session = Depends(get_db), _: str = Depends(verify_token)):
    rec = db.query(AttendanceDB).filter(AttendanceDB.session_date == payload.session_date, AttendanceDB.slot_time == payload.slot_time).first()
    if not rec:
        rec = AttendanceDB(
            session_date=payload.session_date,
            slot_time=payload.slot_time,
            topic_taught=payload.topic_taught,
            students_json=payload.students_json
        )
        db.add(rec)
    else:
        rec.topic_taught = payload.topic_taught
        rec.students_json = payload.students_json
        rec.updated_at = datetime.utcnow()
    db.commit()
    return {"status": "SUCCESS", "message": "Attendance & topic ledger synchronized."}

@app.get("/api/v1/admin/transmissions", response_model=List[TransmissionSchema])
def get_transmissions(db: Session = Depends(get_db), _: str = Depends(verify_token)):
    return db.query(TransmissionDB).order_by(TransmissionDB.timestamp.desc()).all()

@app.delete("/api/v1/admin/transmissions/{tx_id}")
def delete_transmission(tx_id: int, db: Session = Depends(get_db), _: str = Depends(verify_token)):
    tx = db.query(TransmissionDB).filter(TransmissionDB.id == tx_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transmission not found")
    db.delete(tx)
    db.commit()
    return {"status": "SUCCESS", "message": f"Transmission #{tx_id} cleared from database."}