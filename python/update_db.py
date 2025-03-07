import psycopg2
from psycopg2 import OperationalError
from config import DB_CONFIG
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
        logging.FileHandler('db_update.log', encoding='utf-8')
    ]
)
logger = logging.getLogger(__name__)

def update_database():
    """更新数据库结构以匹配当前API实现"""
    logger.info("开始数据库更新流程...")
    
    try:
        # 连接到默认的 postgres 数据库
        logger.info("连接到默认数据库...")
        conn = psycopg2.connect(
            dbname='postgres',
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password'],
            host=DB_CONFIG['host'],
            port=DB_CONFIG['port']
        )
        conn.autocommit = True
        cur = conn.cursor()

        # 创建数据库（如果不存在）
        logger.info(f"检查数据库 {DB_CONFIG['dbname']} 是否存在...")
        cur.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = %s", (DB_CONFIG['dbname'],))
        if not cur.fetchone():
            logger.info(f"创建数据库 {DB_CONFIG['dbname']}...")
            cur.execute(f"CREATE DATABASE {DB_CONFIG['dbname']}")
            logger.info("数据库创建成功！")
        else:
            logger.info("数据库已存在，跳过创建步骤。")
        
        # 关闭到 postgres 的连接
        cur.close()
        conn.close()

        # 连接到新创建的数据库
        logger.info(f"连接到 {DB_CONFIG['dbname']} 数据库...")
        conn = psycopg2.connect(
            dbname=DB_CONFIG['dbname'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password'],
            host=DB_CONFIG['host'],
            port=DB_CONFIG['port']
        )
        conn.autocommit = True
        cur = conn.cursor()

        # 检查 videos 表是否存在
        cur.execute("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'videos')")
        videos_exists = cur.fetchone()[0]

        # 检查 user_ratings 表是否存在
        cur.execute("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_ratings')")
        user_ratings_exists = cur.fetchone()[0]

        # 如果 user_ratings 表存在，先删除它（因为它依赖于 videos 表）
        if user_ratings_exists:
            logger.info("删除 user_ratings 表...")
            cur.execute("DROP TABLE user_ratings")

        # 如果 videos 表存在，检查缺少的列
        if videos_exists:
            # 检查并添加缺少的列
            columns_to_check = [
                ('rating_count', 'INTEGER DEFAULT 0'),
                ('is_approved', 'BOOLEAN DEFAULT FALSE'),
                ('sam_valence_avg', 'FLOAT'),
                ('sam_arousal_avg', 'FLOAT')
            ]
            
            for column_name, column_type in columns_to_check:
                cur.execute(f"""
                    SELECT EXISTS (
                        SELECT FROM information_schema.columns 
                        WHERE table_name = 'videos' AND column_name = '{column_name}'
                    )
                """)
                if not cur.fetchone()[0]:
                    logger.info(f"添加 {column_name} 列到 videos 表...")
                    cur.execute(f"ALTER TABLE videos ADD COLUMN {column_name} {column_type}")
        else:
            # 创建 videos 表
            logger.info("创建 videos 表...")
            cur.execute('''
                CREATE TABLE videos (
                    id SERIAL PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    src TEXT NOT NULL,
                    rvm_valence FLOAT DEFAULT 0.5,
                    rvm_arousal FLOAT DEFAULT 0.5,
                    sam_valence_avg FLOAT,
                    sam_arousal_avg FLOAT,
                    rating_count INTEGER DEFAULT 0,
                    is_approved BOOLEAN DEFAULT FALSE,
                    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    uploader VARCHAR(255) DEFAULT 'system',
                    view_count INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # 创建索引
            logger.info("创建索引...")
            cur.execute("CREATE INDEX IF NOT EXISTS idx_videos_rating_count ON videos (rating_count)")
            cur.execute("CREATE INDEX IF NOT EXISTS idx_videos_is_approved ON videos (is_approved)")
            cur.execute("CREATE INDEX IF NOT EXISTS idx_videos_valence_arousal ON videos (rvm_valence, rvm_arousal)")

        # 创建 user_ratings 表（如果不存在）
        if not user_ratings_exists:
            logger.info("创建 user_ratings 表...")
            cur.execute('''
                CREATE TABLE user_ratings (
                    id SERIAL PRIMARY KEY,
                    user_id VARCHAR(255) NOT NULL,
                    video_id INTEGER NOT NULL REFERENCES videos(id),
                    sam_valence FLOAT NOT NULL,
                    sam_arousal FLOAT NOT NULL,
                    watch_duration INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # 创建索引
            logger.info("创建用户评分索引...")
            cur.execute("CREATE INDEX IF NOT EXISTS idx_user_ratings_video_id ON user_ratings (video_id)")

        # 检查是否有测试数据
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
                    "INSERT INTO videos (title, src, rvm_valence, rvm_arousal) VALUES (%s, %s, 0.5, 0.5)",
                    (title, src)
                )

        conn.commit()
        logger.info("数据库更新完成！")
        return True

    except Exception as e:
        logger.error(f"更新数据库时出错: {str(e)}")
        logger.error(traceback.format_exc())
        return False

    finally:
        if 'cur' in locals() and cur:
            cur.close()
        if 'conn' in locals() and conn:
            conn.close()

if __name__ == '__main__':
    try:
        if update_database():
            logger.info("数据库更新成功！")
            sys.exit(0)
        else:
            logger.error("数据库更新失败！")
            sys.exit(1)
    except Exception as e:
        logger.error(f"程序执行出错: {str(e)}")
        logger.error(traceback.format_exc())
        sys.exit(1)
