from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import secrets
import uuid
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 创建FastAPI应用
app = FastAPI(title="Simple Video Player API")

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 定义模型
class UserCreate(BaseModel):
    username: str
    password: str
    email: str = None
    fullName: str = None

class LoginForm(BaseModel):
    username: str
    password: str

# 用户存储（测试用）
users_db = {}

# 视频数据模拟
videos_db = [
    {"id": str(uuid.uuid4()), "title": "测试视频1", "url": "https://example.com/video1.mp4", "thumbnail": "https://example.com/thumb1.jpg"},
    {"id": str(uuid.uuid4()), "title": "测试视频2", "url": "https://example.com/video2.mp4", "thumbnail": "https://example.com/thumb2.jpg"},
    {"id": str(uuid.uuid4()), "title": "测试视频3", "url": "https://example.com/video3.mp4", "thumbnail": "https://example.com/thumb3.jpg"},
]

# API路由
@app.get("/")
async def root():
    logger.info("访问根路径")
    return {"message": "Welcome to Simple Video Player API"}

@app.get("/api/videos")
async def get_videos():
    logger.info("获取视频列表")
    return videos_db

@app.post("/api/register")
async def register(user: UserCreate):
    logger.info(f"注册用户请求: {user.username}")
    
    if user.username in users_db:
        logger.warning(f"用户名已存在: {user.username}")
        raise HTTPException(status_code=400, detail="用户名已存在")
    
    # 存储用户（不加密密码，仅供测试）
    users_db[user.username] = {
        "username": user.username,
        "password": user.password,
        "email": user.email,
        "fullName": user.fullName
    }
    
    logger.info(f"用户注册成功: {user.username}")
    return {"token": "fake-test-token", "message": "注册成功"}

@app.post("/api/login")
async def login(form_data: LoginForm):
    logger.info(f"登录请求: {form_data.username}")
    
    user = users_db.get(form_data.username)
    
    if not user or user["password"] != form_data.password:
        logger.warning(f"登录失败: {form_data.username}")
        raise HTTPException(status_code=401, detail="用户名或密码错误")
    
    logger.info(f"登录成功: {form_data.username}")
    return {"token": "fake-test-token", "message": "登录成功"}

if __name__ == "__main__":
    import uvicorn
    logger.info("启动简易API服务器在 http://localhost:8081")
    uvicorn.run(app, host="0.0.0.0", port=8081, log_level="info")
