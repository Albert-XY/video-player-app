#!/usr/bin/env python
# -*- coding: utf-8 -*-

from flask import Blueprint, jsonify, request
from datetime import datetime

# 创建蓝图 - 设置url_prefix=''因为前缀已在app.py中添加
blueprint = Blueprint('videos', __name__, url_prefix='')

# 模拟数据
videos_db = [
    {
        "id": 1,
        "title": "测试视频1",
        "url": "https://example.com/video1.mp4",
        "description": "这是第一个测试视频",
        "added_date": datetime.now().isoformat()
    },
    {
        "id": 2,
        "title": "测试视频2",
        "url": "https://example.com/video2.mp4",
        "description": "这是第二个测试视频",
        "added_date": datetime.now().isoformat()
    }
]

# 获取所有视频
def get_all_videos():
    return videos_db

# 通过ID获取视频
def get_video_by_id(video_id):
    for video in videos_db:
        if video['id'] == video_id:
            return video
    return None

# 添加新视频
def add_video(video_data):
    video_id = len(videos_db) + 1
    new_video = {
        "id": video_id,
        **video_data,
        "added_date": datetime.now().isoformat()
    }
    videos_db.append(new_video)
    return new_video

# 路由处理

@blueprint.route('/', methods=['GET'])
def get_videos():
    """获取所有视频"""
    videos = get_all_videos()
    return jsonify(videos)

@blueprint.route('/<int:video_id>/', methods=['GET'])
def get_video(video_id):
    """获取单个视频"""
    video = get_video_by_id(video_id)
    if video:
        return jsonify(video)
    return jsonify({"error": "未找到视频"}), 404

@blueprint.route('/', methods=['POST'])
def create_video():
    """创建新视频"""
    if not request.is_json:
        return jsonify({"error": "请求体必须是JSON格式"}), 400
    
    data = request.get_json()
    required_fields = ['title', 'url']
    
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"缺少必填字段: {field}"}), 400
    
    new_video = add_video(data)
    return jsonify(new_video), 201

@blueprint.route('/unrated/', methods=['GET'])
def get_unrated_videos():
    """获取未评分视频"""
    # 这里简化实现，返回所有视频
    return jsonify(videos_db)

@blueprint.route('/approved/', methods=['GET'])
def get_approved_videos():
    """获取已批准视频"""
    # 这里简化实现，返回所有视频
    return jsonify(videos_db)
