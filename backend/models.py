from sqlalchemy import Column, Integer, Float, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from sqlalchemy import DateTime
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String)  # "user" hoặc "admin"

    predictions = relationship("Prediction", back_populates="owner")


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))

    Location = Column(String)
    LotArea = Column(Float)
    OverallQual = Column(Integer)
    OverallCond = Column(Integer)
    YearBuilt = Column(Integer)
    TotalBsmtSF = Column(Float)
    GrLivArea = Column(Float)
    FullBath = Column(Integer)
    BedroomAbvGr = Column(Integer)

    predicted_price = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="predictions")