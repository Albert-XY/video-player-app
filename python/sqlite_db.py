import sqlite3
import logging
import sys
import traceback
import os

# 配置日志输出
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('sqlite_db.log', encoding='utf-8')
    ]
)
logger = logging.getLogger(__name__)

# 数据库文件路径
DB_FILE = 'video_player.db'

def init_sqlite_database():
    """初始化SQLite数据库作为临时测试环境"""
    logger.info("开始SQLite数据库初始化流程...")
    
    try:
        # 检查数据库目录是否存在
        db_dir = os.path.dirname(DB_FILE)
        if db_dir and not os.path.exists(db_dir):
            os.makedirs(db_dir)
            
        # 连接到SQLite数据库（如果不存在会自动创建）
        logger.info(f"连接到SQLite数据库: {DB_FILE}")
        conn = sqlite3.connect(DB_FILE)
        cur = conn.cursor()

        # 创建视频表
        logger.info("创建videos表...")
        cur.execute('''
            CREATE TABLE IF NOT EXISTS videos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                src TEXT NOT NULL,
                rvm_valence REAL DEFAULT 0.5,
                rvm_arousal REAL DEFAULT 0.5,
                sam_valence_avg REAL,
                sam_arousal_avg REAL,
                rating_count INTEGER DEFAULT 0,
                is_approved INTEGER DEFAULT 0,
                upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                uploader TEXT DEFAULT 'system',
                view_count INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        # 创建用户评分表
        logger.info("创建user_ratings表...")
        cur.execute('''
            CREATE TABLE IF NOT EXISTS user_ratings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                video_id INTEGER NOT NULL,
                sam_valence REAL NOT NULL,
                sam_arousal REAL NOT NULL,
                watch_duration INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (video_id) REFERENCES videos (id)
            )
        ''')

        # 创建索引
        logger.info("创建索引...")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_videos_rating_count ON videos (rating_count)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_videos_is_approved ON videos (is_approved)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_videos_valence_arousal ON videos (rvm_valence, rvm_arousal)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_user_ratings_video_id ON user_ratings (video_id)")

        # 检查是否已有测试数据
        cur.execute("SELECT COUNT(*) FROM videos")
        video_count = cur.fetchone()[0]
        
        if video_count == 0:
            # 插入测试数据
            logger.info("插入测试视频数据...")
            test_videos = [
                ("测试视频1", "https://www.w3schools.com/html/mov_bbb.mp4"),
                ("测试视频2", "https://www.w3schools.com/html/movie.mp4"),
                ("测试视频3", "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4"),
                ("测试视频4", "https://download.samplelib.com/mp4/sample-5s.mp4"),
                ("测试视频5", "https://download.samplelib.com/mp4/sample-10s.mp4")
            ]
            
            for title, src in test_videos:
                cur.execute(
                    "INSERT INTO videos (title, src, rvm_valence, rvm_arousal) VALUES (?, ?, ?, ?)",
                    (title, src, 0.5, 0.5)
                )

        conn.commit()
        logger.info("SQLite数据库初始化完成！")
        
        # 打印数据库路径供前端配置使用
        abs_path = os.path.abspath(DB_FILE)
        logger.info(f"SQLite数据库文件位置: {abs_path}")
        logger.info("请在前端配置文件中设置 DATABASE_URL=sqlite:///{abs_path}")
        
        return True

    except Exception as e:
        logger.error(f"初始化SQLite数据库时出错: {str(e)}")
        logger.error(traceback.format_exc())
        return False

    finally:
        if 'cur' in locals() and cur:
            cur.close()
        if 'conn' in locals() and conn:
            conn.close()

if __name__ == '__main__':
    try:
        if init_sqlite_database():
            logger.info("SQLite数据库初始化成功！")
            sys.exit(0)
        else:
            logger.error("SQLite数据库初始化失败！")
            sys.exit(1)
    except Exception as e:
        logger.error(f"程序执行出错: {str(e)}")
        logger.error(traceback.format_exc())
        sys.exit(1)
