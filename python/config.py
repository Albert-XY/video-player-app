# -*- coding: utf-8 -*-

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
load_dotenv('.env.local')  # Load local config with higher priority

# Spider settings
SPIDER_SETTINGS = {
    'ALLOWED_DOMAINS': ['bilibili.com', 'b23.tv'],
    'START_URLS': [
        'https://www.bilibili.com/v/popular/rank/all',
        'https://www.bilibili.com/v/popular/rank/dance',
        'https://www.bilibili.com/v/popular/rank/music'
    ],
    'DOWNLOAD_DELAY': 10,  # 增加到10秒
    'CONCURRENT_REQUESTS': 1,  # 减少到1个并发请求
    'USER_AGENT': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'RETRY_TIMES': 3,
    'RETRY_HTTP_CODES': [500, 502, 503, 504, 522, 524, 408, 429],
    'COOKIES_ENABLED': True,
    'ROBOTSTXT_OBEY': True,  # 确保遵守robots.txt
    'DEFAULT_REQUEST_HEADERS': {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
    },
    'CLOSESPIDER_PAGECOUNT': 10,  # 限制爬取的页面数量
    'CLOSESPIDER_ITEMCOUNT': 100,  # 限制爬取的视频数量
    'DAILY_REQUEST_LIMIT': 100,  # 每日请求限制
}

# Database settings
DB_CONFIG = {
    'dbname': os.getenv('DB_NAME', 'video_player'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', '6322067'),
    'host': os.getenv('DB_HOST', '127.0.0.1'),
    'port': os.getenv('DB_PORT', '5432'),
    'connect_timeout': 3,
    'max_retries': 3,
    'retry_interval': 1,
}

# SQLite数据库配置
SQLITE_CONFIG = {
    'db_file': os.getenv('SQLITE_DB_FILE', 'video_player.db'),
    'use_sqlite': os.getenv('DATABASE_URL', '').startswith('sqlite://')
}

# 为了向后兼容
db_name = DB_CONFIG['dbname']
db_user = DB_CONFIG['user']
db_password = DB_CONFIG['password']
db_host = DB_CONFIG['host']
db_port = DB_CONFIG['port']

# Video settings
VIDEO_CONFIG = {
    'MAX_SIZE_MB': 500,  # 最大视频大小（MB）
    'ALLOWED_FORMATS': ['mp4', 'webm'],
    'DOWNLOAD_PATH': os.path.join(os.path.dirname(os.path.dirname(__file__)), 'downloads'),
    'MIN_DURATION': 150,  # 最短视频时长（秒）
    'MAX_DURATION': 210,  # 最长视频时长（秒）
    'MIN_RESOLUTION': (720, 480),  # 最低分辨率
    'TARGET_FPS': 30,  # 目标帧率
}

# SAM评分设置
SAM_RATING_CONFIG = {
    'MAX_UNRATED_VIDEOS': 40,  # 未评分视频总数上限
    'MIN_RATINGS_PER_VIDEO': 16,  # 每个视频最少需要的评分数
    'VALENCE_DEVIATION_THRESHOLD': 0.2,  # 效价偏离中性的阈值
    'AROUSAL_DEVIATION_THRESHOLD': 0.2,  # 唤醒度偏离中性的阈值
    'VALENCE_VARIANCE_THRESHOLD': 0.06,  # 效价方差阈值
    'AROUSAL_VARIANCE_THRESHOLD': 0.06,  # 唤醒度方差阈值
}

# Storage settings
STORAGE_CONFIG = {
    'MIN_FREE_SPACE_GB': 5,  # 最小剩余空间（GB）
    'TEMP_DIR': os.path.join(os.path.dirname(os.path.dirname(__file__)), 'temp'),
    'CACHE_DIR': os.path.join(os.path.dirname(os.path.dirname(__file__)), 'cache'),
    'MAX_CACHE_SIZE_GB': 2,  # 最大缓存大小（GB）
    'CLEANUP_THRESHOLD': 0.9,  # 清理阈值（当使用率达到90%时）
}
