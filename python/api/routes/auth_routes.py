#!/usr/bin/env python
# -*- coding: utf-8 -*-

from flask import Blueprint, jsonify, request
import hashlib
import time
import jwt

# 创建蓝图 - 设置url_prefix=''因为前缀已在app.py中添加
blueprint = Blueprint('auth', __name__, url_prefix='')

# 模拟用户数据
users_db = [
    {
        "id": 1,
        "username": "testuser",
        # 密码: "password" (加密后)
        "password_hash": "5f4dcc3b5aa765d61d8327deb882cf99",
        "email": "test@example.com",
        "full_name": "测试用户"
    }
]

# JWT配置
JWT_SECRET = "video-player-app-jwt-secret"
JWT_EXPIRATION_SECONDS = 3600 * 24  # 24小时

# 工具函数
def hash_password(password):
    """简单的密码哈希"""
    return hashlib.md5(password.encode()).hexdigest()

def find_user_by_username(username):
    """通过用户名查找用户"""
    for user in users_db:
        if user['username'] == username:
            return user
    return None

def authenticate_user(username, password):
    """验证用户凭据"""
    user = find_user_by_username(username)
    if not user:
        return None
    
    password_hash = hash_password(password)
    if user['password_hash'] != password_hash:
        return None
    
    return user

def generate_token(user_id):
    """生成JWT令牌"""
    payload = {
        'user_id': user_id,
        'exp': int(time.time()) + JWT_EXPIRATION_SECONDS
    }
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')

# 路由处理

@blueprint.route('/login/', methods=['POST'])
def login():
    """用户登录"""
    if not request.is_json:
        return jsonify({"error": "请求体必须是JSON格式"}), 400
    
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({"error": "用户名和密码都是必需的"}), 400
    
    user = authenticate_user(username, password)
    if not user:
        return jsonify({"error": "用户名或密码不正确"}), 401
    
    # 生成令牌
    token = generate_token(user['id'])
    
    # 返回用户信息和令牌
    return jsonify({
        "success": True,
        "userId": user['id'],
        "username": user['username'],
        "token": token
    })

@blueprint.route('/register/', methods=['POST'])
def register():
    """用户注册"""
    if not request.is_json:
        return jsonify({"error": "请求体必须是JSON格式"}), 400
    
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')
    full_name = data.get('fullName')
    
    if not username or not password or not email:
        return jsonify({"error": "用户名、密码和电子邮件是必需的"}), 400
    
    # 检查用户名是否已存在
    if find_user_by_username(username):
        return jsonify({"error": "用户名已存在"}), 409
    
    # 创建新用户
    new_user = {
        "id": len(users_db) + 1,
        "username": username,
        "password_hash": hash_password(password),
        "email": email,
        "full_name": full_name
    }
    
    users_db.append(new_user)
    
    return jsonify({
        "success": True,
        "message": "用户注册成功"
    }), 201
