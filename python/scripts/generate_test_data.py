#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
视频播放器应用 - 测试数据生成脚本
此脚本生成模拟数据并插入到数据库中，用于本地开发和测试环境
"""

import os
import sys
import random
import datetime
import json
from pathlib import Path

# 添加项目根目录到路径
root_dir = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(root_dir))

try:
    # 尝试导入数据库模型和工具
    from python.models import db, User, Video, Comment, Category, Playlist, UserActivity
    from python.config import config
except ImportError:
    print("错误: 无法导入数据库模型，请确保在项目根目录运行此脚本")
    sys.exit(1)

# 示例数据
USERS = [
    {"username": "admin", "email": "admin@example.com", "password": "admin123", "full_name": "管理员", "is_admin": True},
    {"username": "user1", "email": "user1@example.com", "password": "user123", "full_name": "测试用户1"},
    {"username": "user2", "email": "user2@example.com", "password": "user123", "full_name": "测试用户2"},
    {"username": "videomaker", "email": "creator@example.com", "password": "creator123", "full_name": "视频创作者"},
    {"username": "commenter", "email": "comment@example.com", "password": "comment123", "full_name": "评论者"}
]

CATEGORIES = [
    {"name": "教育", "description": "教育类视频"},
    {"name": "娱乐", "description": "娱乐类视频"},
    {"name": "音乐", "description": "音乐类视频"},
    {"name": "科技", "description": "科技类视频"},
    {"name": "游戏", "description": "游戏类视频"},
    {"name": "体育", "description": "体育类视频"},
    {"name": "电影", "description": "电影类视频"},
    {"name": "动画", "description": "动画类视频"}
]

# 模拟视频数据
VIDEO_TITLES = [
    "初学者Python教程",
    "高级JavaScript技巧",
    "React框架入门到精通",
    "Vue.js实战项目开发",
    "数据结构与算法",
    "机器学习基础",
    "深度学习实战",
    "Web前端开发最佳实践",
    "后端开发技术栈",
    "DevOps与CI/CD",
    "区块链技术原理",
    "云计算与微服务架构",
    "移动应用开发教程",
    "数据库优化与管理",
    "网络安全基础",
    "操作系统原理",
    "计算机网络基础",
    "软件工程与项目管理",
    "UI/UX设计原则",
    "游戏开发入门"
]

VIDEO_DESCRIPTIONS = [
    "本视频详细介绍了{topic}的基础知识，适合初学者。",
    "深入探讨{topic}的高级应用，提供实用技巧。",
    "全面讲解{topic}的核心概念和实际应用场景。",
    "通过实际项目演示{topic}的开发流程和最佳实践。",
    "{topic}完整教程，从入门到精通的学习路径。",
    "解析{topic}中常见的问题和解决方案。",
    "剖析{topic}的底层原理和实现机制。",
    "{topic}专业指南，帮助你快速掌握关键技能。",
    "探索{topic}的前沿发展和未来趋势。",
    "{topic}实战案例分析，提升实际开发能力。"
]

# 视频URL列表（使用一些免费的示例视频）
VIDEO_URLS = [
    "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
    "https://samplelib.com/lib/preview/mp4/sample-10s.mp4",
    "https://samplelib.com/lib/preview/mp4/sample-15s.mp4",
    "https://samplelib.com/lib/preview/mp4/sample-20s.mp4",
    "https://samplelib.com/lib/preview/mp4/sample-30s.mp4",
    "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4",
    "https://file-examples.com/storage/fe8c7eef0c6364f6c9504cc/2017/04/file_example_MP4_480_1_5MG.mp4",
    "https://file-examples.com/storage/fe8c7eef0c6364f6c9504cc/2017/04/file_example_MP4_640_3MG.mp4",
    "https://file-examples.com/storage/fe8c7eef0c6364f6c9504cc/2017/04/file_example_MP4_1280_10MG.mp4",
    "https://file-examples.com/storage/fe8c7eef0c6364f6c9504cc/2017/04/file_example_MP4_1920_18MG.mp4"
]

# 缩略图URL列表
THUMBNAIL_URLS = [
    "https://via.placeholder.com/320x180?text=Video+Thumbnail+1",
    "https://via.placeholder.com/320x180?text=Video+Thumbnail+2",
    "https://via.placeholder.com/320x180?text=Video+Thumbnail+3",
    "https://via.placeholder.com/320x180?text=Video+Thumbnail+4",
    "https://via.placeholder.com/320x180?text=Video+Thumbnail+5",
    "https://via.placeholder.com/320x180?text=Video+Thumbnail+6",
    "https://via.placeholder.com/320x180?text=Video+Thumbnail+7",
    "https://via.placeholder.com/320x180?text=Video+Thumbnail+8",
    "https://via.placeholder.com/320x180?text=Video+Thumbnail+9",
    "https://via.placeholder.com/320x180?text=Video+Thumbnail+10"
]

# 评论模板
COMMENTS = [
    "很棒的视频，学到了很多！",
    "讲解非常清晰，谢谢分享。",
    "内容有点深奥，希望能有更详细的解释。",
    "这个主题很有意思，期待更多相关内容。",
    "视频质量很高，音质也不错。",
    "讲得太快了，希望能放慢一点。",
    "非常实用的知识点，已经收藏了。",
    "这个例子很好地说明了核心概念。",
    "希望能有更多的实际案例分析。",
    "讲解方式很生动，容易理解。",
    "内容组织得很好，逻辑清晰。",
    "我有一个问题，{topic}如何应用在实际项目中？",
    "这个技术对初学者友好吗？",
    "视频时长适中，内容充实。",
    "我在实践中遇到了一些问题，希望有更详细的错误处理说明。"
]

def generate_users():
    """生成用户数据"""
    created_users = []
    for user_data in USERS:
        # 检查用户是否已存在
        existing_user = User.query.filter_by(username=user_data['username']).first()
        if existing_user:
            print(f"用户 {user_data['username']} 已存在，跳过创建")
            created_users.append(existing_user)
            continue
            
        user = User(
            username=user_data['username'],
            email=user_data['email'],
            password=user_data['password'],  # 实际应用中应该对密码进行哈希处理
            full_name=user_data['full_name'],
            is_admin=user_data.get('is_admin', False),
            created_at=datetime.datetime.now(),
            updated_at=datetime.datetime.now()
        )
        db.session.add(user)
        created_users.append(user)
        print(f"创建用户: {user_data['username']}")
    
    db.session.commit()
    return created_users

def generate_categories():
    """生成视频分类数据"""
    created_categories = []
    for category_data in CATEGORIES:
        # 检查分类是否已存在
        existing_category = Category.query.filter_by(name=category_data['name']).first()
        if existing_category:
            print(f"分类 {category_data['name']} 已存在，跳过创建")
            created_categories.append(existing_category)
            continue
            
        category = Category(
            name=category_data['name'],
            description=category_data['description'],
            created_at=datetime.datetime.now()
        )
        db.session.add(category)
        created_categories.append(category)
        print(f"创建分类: {category_data['name']}")
    
    db.session.commit()
    return created_categories

def generate_videos(users, categories, count=30):
    """生成视频数据"""
    created_videos = []
    for i in range(count):
        title = random.choice(VIDEO_TITLES) + f" ({i+1})"
        description_template = random.choice(VIDEO_DESCRIPTIONS)
        description = description_template.format(topic=title.split()[0])
        
        user = random.choice(users)
        category = random.choice(categories)
        url = random.choice(VIDEO_URLS)
        thumbnail = random.choice(THUMBNAIL_URLS)
        
        # 生成随机时长（30秒到30分钟）
        duration = random.randint(30, 1800)
        
        # 生成随机观看次数
        views = random.randint(10, 10000)
        
        # 生成随机评分（1-5星）
        rating = round(random.uniform(1, 5), 1)
        
        video = Video(
            title=title,
            description=description,
            url=url,
            thumbnail=thumbnail,
            duration=duration,
            user_id=user.id,
            category_id=category.id,
            views=views,
            rating=rating,
            created_at=datetime.datetime.now() - datetime.timedelta(days=random.randint(1, 100)),
            updated_at=datetime.datetime.now()
        )
        db.session.add(video)
        created_videos.append(video)
        print(f"创建视频: {title}")
    
    db.session.commit()
    return created_videos

def generate_comments(users, videos, count=100):
    """生成评论数据"""
    for i in range(count):
        user = random.choice(users)
        video = random.choice(videos)
        comment_template = random.choice(COMMENTS)
        comment_text = comment_template.format(topic=video.title.split()[0])
        
        # 生成随机评论时间（在视频创建时间之后）
        days_after_video = random.randint(0, (datetime.datetime.now() - video.created_at).days)
        comment_date = video.created_at + datetime.timedelta(days=days_after_video)
        
        comment = Comment(
            content=comment_text,
            user_id=user.id,
            video_id=video.id,
            created_at=comment_date
        )
        db.session.add(comment)
        if i % 10 == 0:
            print(f"已创建 {i} 条评论...")
    
    db.session.commit()
    print(f"总共创建了 {count} 条评论")

def generate_playlists(users, videos, count=15):
    """生成播放列表数据"""
    for i in range(count):
        user = random.choice(users)
        playlist_name = f"{user.username}的播放列表 {i+1}"
        
        # 为播放列表随机选择1-10个视频
        playlist_videos = random.sample(videos, random.randint(1, min(10, len(videos))))
        
        playlist = Playlist(
            name=playlist_name,
            description=f"{user.username}创建的视频集合",
            user_id=user.id,
            created_at=datetime.datetime.now(),
            updated_at=datetime.datetime.now()
        )
        db.session.add(playlist)
        db.session.flush()  # 获取playlist.id
        
        # 添加视频到播放列表
        for idx, video in enumerate(playlist_videos):
            playlist.videos.append(video)
        
        print(f"创建播放列表: {playlist_name}，包含 {len(playlist_videos)} 个视频")
    
    db.session.commit()

def generate_user_activities(users, videos, count=200):
    """生成用户活动数据"""
    activity_types = ["view", "like", "share", "save"]
    
    for i in range(count):
        user = random.choice(users)
        video = random.choice(videos)
        activity_type = random.choice(activity_types)
        
        # 生成随机活动时间（在视频创建时间之后）
        days_after_video = random.randint(0, (datetime.datetime.now() - video.created_at).days)
        activity_date = video.created_at + datetime.timedelta(days=days_after_video)
        
        activity = UserActivity(
            user_id=user.id,
            video_id=video.id,
            activity_type=activity_type,
            created_at=activity_date
        )
        db.session.add(activity)
        
        if i % 20 == 0:
            print(f"已创建 {i} 条用户活动记录...")
    
    db.session.commit()
    print(f"总共创建了 {count} 条用户活动记录")

def main():
    """主函数，生成所有测试数据"""
    print("开始生成测试数据...")
    
    # 初始化数据库连接（根据实际项目调整）
    print("连接数据库...")
    
    try:
        # 生成基础数据
        users = generate_users()
        categories = generate_categories()
        
        # 生成视频数据
        videos = generate_videos(users, categories, count=30)
        
        # 生成评论、播放列表和用户活动数据
        generate_comments(users, videos, count=100)
        generate_playlists(users, videos, count=15)
        generate_user_activities(users, videos, count=200)
        
        print("测试数据生成完成！")
        
    except Exception as e:
        db.session.rollback()
        print(f"生成测试数据失败: {str(e)}")
        import traceback
        traceback.print_exc()
    
if __name__ == "__main__":
    main()
