from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import ForeignKey, create_engine, Column, Integer, String, Boolean
from sqlalchemy.orm import sessionmaker, Session, declarative_base, relationship
from passlib.context import CryptContext
from fastapi.middleware.cors import CORSMiddleware

from datetime import datetime, timedelta
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt

# база даних
DATABASE_URL = "sqlite:///./app.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# модель користувача
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)

    account = relationship("Account", uselist=False, back_populates="user")

class UserCreate(BaseModel):
    username: str  
    email: EmailStr 
    password: str  

    class Config:
        orm_mode = True  

class UserLogin(BaseModel):
    email: EmailStr  
    password: str  

    class Config:
        orm_mode = True 


class UserResponse(BaseModel):
    username: str
    email: str

    class Config:
        orm_mode = True

class AdminUserResponse(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        orm_mode = True
        
class LastTransactionResponse(BaseModel):
    amount: int
    type: str
    timestamp: str

    class Config:
        orm_mode = True

class AdminUserDetailResponse(BaseModel):
    id: int
    username: str
    balance: int
    email: str
    last_transaction: Optional[LastTransactionResponse]

    class Config:
        orm_mode = True



class Account(Base):
    __tablename__ = "accounts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    balance = Column(Integer, default=10000)  # баланс користувача

    user = relationship("User", back_populates="account")

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Integer)
    type = Column(String)  # z operacji mam: Wypłata, Wpłata
    timestamp = Column(String, default=datetime.utcnow)

    user = relationship("User", back_populates="transactions")

User.transactions = relationship("Transaction", back_populates="user")


class TransactionResponse(BaseModel):
    amount: int
    type: str
    timestamp: str

    class Config:
        orm_mode = True


class AccountResponse(BaseModel):
    balance: int

    class Config:
        orm_mode = True


class DepositRequest(BaseModel):
    amount: int

class WithdrawRequest(BaseModel):
    amount: int


app = FastAPI()




app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)




# сесія з бд
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()





@app.get("/users/", response_model=List[UserResponse])
def read_users(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    users = db.query(User).offset(skip).limit(limit).all()
    return users



@app.post("/auth/register/")
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered!")
    new_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hash_password(user.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    new_account = Account(
        user_id=new_user.id,
        balance=10000  
    )

    db.add(new_account)
    db.commit()
    db.refresh(new_account)

    return {"message": "User registered successfully with an initial balance of 10,000"}



SECRET_KEY = "mysecretkey"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
# логін
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@app.post("/auth/login/")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user is None or not pwd_context.verify(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not db_user.is_active:
        raise HTTPException(status_code=403, detail="User account is deactivated")

    
    access_token = create_access_token(data={"sub": db_user.username})
    return {"access_token": access_token, "token_type": "bearer"}


# створення таблиць у бд
Base.metadata.create_all(bind=engine)

@app.get("/")
def read_root():
    return {"message": "Welcome to the FastAPI app"}



oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        user = db.query(User).filter(User.username == username).first()
        if user is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    return user


@app.get("/users/me/", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user


@app.get("/account/", response_model=UserResponse)
def get_account(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    account = db.query(Account).filter(Account.user_id == current_user.id).first()
    if account is None:
        raise HTTPException(status_code=404, detail="Account not found")
    return {"username": current_user.username, "email": current_user.email, "balance": account.balance}





@app.get("/account/me", response_model=AccountResponse)
def get_account_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    account = db.query(Account).filter(Account.user_id == current_user.id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account





@app.put("/account/deposit/")
def deposit(request: DepositRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    account = db.query(Account).filter(Account.user_id == current_user.id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    if request.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than 0")
    
    account.balance += request.amount
    db.commit()
    db.refresh(account)

    create_transaction(db, current_user.id, request.amount, "Wpłata")

    return {"message": f"Deposited {request.amount} to your account", "balance": account.balance}


@app.put("/account/withdraw/") 
def withdraw(request: WithdrawRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    account = db.query(Account).filter(Account.user_id == current_user.id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    if request.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than 0")
    
    if account.balance < request.amount:
        raise HTTPException(status_code=400, detail="Insufficient funds")
    account.balance -= request.amount
    db.commit()
    db.refresh(account)
    create_transaction(db, current_user.id, request.amount, "Wypłata")

    return {"message": f"Withdrew {request.amount} from your account", "balance": account.balance}


# Функція зняття коштів
@app.put("/account/withdraw/")
def withdraw(request: WithdrawRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    account = db.query(Account).filter(Account.user_id == current_user.id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    if request.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than 0")
    
    if account.balance < request.amount:
        raise HTTPException(status_code=400, detail="Insufficient funds")
    
    account.balance -= request.amount
    db.commit()
    db.refresh(account)

    return {"message": f"Withdrew {request.amount} from your account", "balance": account.balance}




def create_transaction(db: Session, user_id: int, amount: int, transaction_type: str):
    new_transaction = Transaction(user_id=user_id, amount=amount, type=transaction_type)
    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)


@app.get("/transactions/", response_model=List[TransactionResponse])
def get_transactions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    transactions = db.query(Transaction).filter(Transaction.user_id == current_user.id).order_by(Transaction.timestamp.desc()).all()
    return transactions







@app.get("/admin/users/", response_model=List[AdminUserDetailResponse])
def get_all_users_with_balance_and_last_tx(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.email != "admin@gmail.com":
        raise HTTPException(status_code=403, detail="Not authorized")

    users = db.query(User).all()
    results = []
    for u in users:
        account = db.query(Account).filter(Account.user_id == u.id).first()
        last_tx = (
            db.query(Transaction)
            .filter(Transaction.user_id == u.id)
            .order_by(Transaction.timestamp.desc())
            .first()
        )
        last_tx_response = None
        if last_tx:
            last_tx_response = LastTransactionResponse(
                amount=last_tx.amount,
                type=last_tx.type,
                timestamp=last_tx.timestamp,
            )
        results.append(
            AdminUserDetailResponse(
                id=u.id,
                username=u.username,
                email=u.email,
                balance=account.balance if account else 0,
                last_transaction=last_tx_response,
            )
        )
    return results