from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

# Secret key for JWT
SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

app = FastAPI()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# In-memory storage
fake_users_db = {}
workflow_states_db: Dict[str, Dict[str, Any]] = {}  # Store workflow states by user email

class User(BaseModel):
    email: str
    password: str

class UserInDB(User):
    hashed_password: str

class WorkflowState(BaseModel):
    current_state: str
    data: Optional[Dict[str, Any]] = None

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@app.post("/register")
async def register(user: User):
    if user.email in fake_users_db:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(user.password)
    fake_users_db[user.email] = UserInDB(email=user.email, hashed_password=hashed_password)
    # Initialize workflow state for new user
    workflow_states_db[user.email] = {"current_state": "initial", "data": {}}
    return {"message": "Registration successful"}

@app.post("/login")
async def login(user: User):
    user_in_db = fake_users_db.get(user.email)
    if not user_in_db or not verify_password(user.password, user_in_db.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/state/{user_email}")
async def get_workflow_state(user_email: str):
    if user_email not in workflow_states_db:
        raise HTTPException(status_code=404, detail="User workflow state not found")
    return workflow_states_db[user_email]

@app.post("/state/{user_email}/transition")
async def update_workflow_state(user_email: str, new_state: WorkflowState):
    if user_email not in workflow_states_db:
        raise HTTPException(status_code=404, detail="User workflow state not found")
    workflow_states_db[user_email] = {
        "current_state": new_state.current_state,
        "data": new_state.data or {}
    }
    return workflow_states_db[user_email]
