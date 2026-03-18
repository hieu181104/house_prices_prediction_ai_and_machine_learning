from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
import joblib
import pandas as pd
import numpy as np

from database import SessionLocal, engine
from models import Base, User, Prediction

# ==============================
# TẠO BẢNG
# ==============================
Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================
# LOAD MODEL
# ==============================
model = joblib.load("model.pkl")

# ==============================
# DB SESSION
# ==============================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ==============================
# SCHEMAS
# ==============================

class UserAuth(BaseModel):
    username: str
    password: str


class PredictRequest(BaseModel):
    user_id: int
    Neighborhood: str
    LotArea: float
    OverallQual: int
    OverallCond: int
    YearBuilt: int
    TotalBsmtSF: float
    GrLivArea: float
    FullBath: int
    BedroomAbvGr: int


# ==============================
# ROOT
# ==============================

@app.get("/")
def home():
    return {"message": "House Price Prediction API is running"}

# ==============================
# REGISTER
# ==============================

@app.post("/register")
def register(user: UserAuth, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    new_user = User(
        username=user.username,
        password=user.password,
        role="user"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User created successfully"}

# ==============================
# LOGIN
# ==============================

@app.post("/login")
def login(user: UserAuth, db: Session = Depends(get_db)):

    db_user = db.query(User).filter(
        User.username == user.username,
        User.password == user.password
    ).first()

    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    return {
        "message": "Login success",
        "user_id": db_user.id,
        "role": db_user.role
    }

# ==============================
# PREDICT (USER)
# ==============================

@app.post("/predict")
def predict_price(request: PredictRequest, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.id == request.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    input_data = pd.DataFrame([{
        "Neighborhood": request.Neighborhood,
        "LotArea": request.LotArea,
        "OverallQual": request.OverallQual,
        "OverallCond": request.OverallCond,
        "YearBuilt": request.YearBuilt,
        "TotalBsmtSF": request.TotalBsmtSF,
        "GrLivArea": request.GrLivArea,
        "FullBath": request.FullBath,
        "BedroomAbvGr": request.BedroomAbvGr,
    }])

    pred_log = model.predict(input_data)[0]
    prediction = float(np.expm1(pred_log))

    new_record = Prediction(
        user_id=request.user_id,
        Location=request.Neighborhood,
        LotArea=request.LotArea,
        OverallQual=request.OverallQual,
        OverallCond=request.OverallCond,
        YearBuilt=request.YearBuilt,
        TotalBsmtSF=request.TotalBsmtSF,
        GrLivArea=request.GrLivArea,
        FullBath=request.FullBath,
        BedroomAbvGr=request.BedroomAbvGr,
        predicted_price=prediction
    )

    db.add(new_record)
    db.commit()

    return {
        "predicted_price": round(prediction, 2),
        "metrics": {
            "r2": 0.880,
            "mae": 17253,
            "rmse": 30183
        }
    }

# ==============================
# USER: XEM LỊCH SỬ CỦA MÌNH
# ==============================

@app.get("/my-predictions/{user_id}")
def get_my_predictions(user_id: int, db: Session = Depends(get_db)):

    return db.query(Prediction).filter(
        Prediction.user_id == user_id
    ).all()

# ==============================
# ADMIN: XEM TẤT CẢ
# ==============================

@app.get("/admin/predictions/{user_id}")
def get_all_predictions(user_id: int, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.id == user_id).first()

    if not user or user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    return db.query(Prediction).all()

# ==============================
# ADMIN: XÓA
# ==============================

@app.delete("/admin/predictions/{prediction_id}/{user_id}")
def delete_prediction(prediction_id: int, user_id: int, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.id == user_id).first()

    if not user or user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    prediction = db.query(Prediction).filter(
        Prediction.id == prediction_id
    ).first()

    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")

    db.delete(prediction)
    db.commit()

    return {"message": "Deleted successfully"}

# ==============================
# ADMIN: THỐNG KÊ
# ==============================

@app.get("/admin/stats/{user_id}")
def stats(user_id: int, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.id == user_id).first()

    if not user or user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    count = db.query(Prediction).count()
    avg_price = db.query(func.avg(Prediction.predicted_price)).scalar()

    return {
        "total_predictions": count,
        "average_price": avg_price
    }