from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "API服务器正常运行"}

@app.post("/api/login")
def login(username: str, password: str):
    # 简单模拟登录，不进行真实校验
    return {"token": "fake-token", "message": "登录成功"}

@app.post("/api/register")
def register(username: str, password: str, email: str = None, fullName: str = None):
    # 简单模拟注册，不进行真实存储
    return {"token": "fake-token", "message": "注册成功"}

@app.get("/api/videos")
def get_videos():
    return [
        {"id": "1", "title": "测试视频1", "url": "https://example.com/video1.mp4"}, 
        {"id": "2", "title": "测试视频2", "url": "https://example.com/video2.mp4"}
    ]

if __name__ == "__main__":
    # 直接在脚本中启动服务器
    uvicorn.run(app, host="0.0.0.0", port=8081)
