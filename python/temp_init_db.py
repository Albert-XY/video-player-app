import sqlite3
import logging
import os
import sys

# 配置日志
logging.basicConfig(level=logging.INFO, 
                   format='%(asctime)s - %(levelname)s - %(message)s',
                   handlers=[logging.StreamHandler(sys.stdout)])
logger = logging.getLogger(__name__)

# 数据库文件
DB_FILE = 'video_player.db'

def init_db():
    """初始化测试数据库"""
    logger.info("开始初始化测试数据库...")
    
    # 检查文件是否存在，如果存在则删除
    if os.path.exists(DB_FILE):
        logger.info(f"删除已存在的数据库文件: {DB_FILE}")
        os.remove(DB_FILE)
    
    # 创建新的数据库连接
    logger.info(f"创建新的数据库: {DB_FILE}")
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    try:
        # 创建视频表
        logger.info("创建 videos 表...")
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS videos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            platform TEXT NOT NULL,
            platform_id TEXT,
            title TEXT NOT NULL,
            description TEXT,
            author TEXT,
            src TEXT NOT NULL,
            thumbnail TEXT,
            duration INTEGER,
            upload_date TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'pending',
            category TEXT,
            tags TEXT,
            views INTEGER DEFAULT 0,
            likes INTEGER DEFAULT 0,
            rating_count INTEGER DEFAULT 0,
            is_approved INTEGER,
            sam_valence_avg REAL,
            sam_arousal_avg REAL
        )
        ''')
        
        # 创建索引
        logger.info("创建索引...")
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_videos_platform_id ON videos(platform, platform_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_videos_rating_count ON videos(rating_count)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_videos_is_approved ON videos(is_approved)')
        
        # 创建用户评分表
        logger.info("创建 user_ratings 表...")
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_ratings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            video_id INTEGER NOT NULL,
            sam_valence REAL NOT NULL,
            sam_arousal REAL NOT NULL,
            watch_duration INTEGER,
            rated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (video_id) REFERENCES videos (id)
        )
        ''')
        
        # 创建索引
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_user_ratings_video_id ON user_ratings(video_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_user_ratings_user_id ON user_ratings(user_id)')
        
        # 插入测试视频数据
        logger.info("插入测试视频数据...")
        videos = [
            (
                'w3schools', '1', '测试视频 1 - 大自然风景', 
                '这是一个测试视频，展示美丽的大自然风景。', 'W3Schools',
                'https://www.w3schools.com/html/mov_bbb.mp4', 
                'https://www.w3schools.com/images/picture.jpg',
                10, '2023-01-01', 'pending', '自然', '风景,自然,测试', 0, 0, 0, None, None, None
            ),
            (
                'w3schools', '2', '测试视频 2 - 海洋生物', 
                '这是一个测试视频，展示各种海洋生物。', 'W3Schools',
                'https://www.w3schools.com/html/movie.mp4', 
                'https://www.w3schools.com/images/picture.jpg',
                15, '2023-01-02', 'pending', '海洋', '海洋,生物,测试', 0, 0, 0, None, None, None
            ),
            (
                'test', '3', '测试视频 3 - 积极情绪', 
                '这是一个测试视频，用于诱发积极情绪。', 'TestUser',
                'https://filesamples.com/samples/video/mp4/sample_640x360.mp4', 
                'https://example.com/thumbnail3.jpg',
                20, '2023-01-03', 'pending', '情绪', '积极,情绪,测试', 0, 0, 0, None, None, None
            ),
            (
                'test', '4', '测试视频 4 - 消极情绪', 
                '这是一个测试视频，用于诱发消极情绪。', 'TestUser',
                'https://filesamples.com/samples/video/mp4/sample_960x540.mp4', 
                'https://example.com/thumbnail4.jpg',
                25, '2023-01-04', 'pending', '情绪', '消极,情绪,测试', 0, 0, 0, None, None, None
            ),
            (
                'test', '5', '测试视频 5 - 中性情绪', 
                '这是一个测试视频，用于诱发中性情绪。', 'TestUser',
                'https://filesamples.com/samples/video/mp4/sample_1280x720.mp4', 
                'https://example.com/thumbnail5.jpg',
                30, '2023-01-05', 'pending', '情绪', '中性,情绪,测试', 0, 0, 0, None, None, None
            )
        ]
        
        cursor.executemany('''
        INSERT INTO videos (
            platform, platform_id, title, description, author, 
            src, thumbnail, duration, upload_date, status, 
            category, tags, views, likes, rating_count, 
            is_approved, sam_valence_avg, sam_arousal_avg
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', videos)
        
        # 提交更改
        conn.commit()
        logger.info("数据库初始化成功！")
        
    except Exception as e:
        logger.error(f"初始化数据库时出错: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    init_db()
