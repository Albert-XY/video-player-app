import psycopg2
from psycopg2 import OperationalError
from config import DB_CONFIG
import time
import logging
import sys
import traceback

# 配置日志输出
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('db_init.log', encoding='utf-8')
    ]
)
logger = logging.getLogger(__name__)

def wait_for_db(max_retries=5, retry_interval=2):
    """等待数据库准备就绪"""
    logger.info("开始检查数据库连接...")
    for attempt in range(max_retries):
        try:
            logger.info(f"尝试连接数据库 (尝试 {attempt + 1}/{max_retries})...")
            conn = psycopg2.connect(
                dbname='postgres',
                user=DB_CONFIG['user'],
                password=DB_CONFIG['password'],
                host=DB_CONFIG['host'],
                port=DB_CONFIG['port'],
                connect_timeout=DB_CONFIG['connect_timeout']
            )
            conn.close()
            logger.info("数据库连接成功！")
            return True
        except OperationalError as e:
            if attempt < max_retries - 1:
                logger.warning(f"数据库未就绪，{retry_interval}秒后重试: {str(e)}")
                time.sleep(retry_interval)
            else:
                logger.error(f"无法连接到数据库: {str(e)}")
                logger.error("请确保PostgreSQL已安装并正在运行，且密码正确")
                return False
        except Exception as e:
            logger.error(f"连接数据库时发生未知错误: {str(e)}")
            logger.error(traceback.format_exc())
            return False

def init_database():
    """初始化数据库"""
    logger.info("开始数据库初始化流程...")
    
    if not wait_for_db():
        return False

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
        cur = conn.cursor()

        # 创建视频表
        logger.info("创建视频表...")
        cur.execute('''
            CREATE TABLE IF NOT EXISTS videos (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                src TEXT NOT NULL,
                rvm_valence FLOAT,
                rvm_arousal FLOAT,
                upload_date TIMESTAMP,
                uploader VARCHAR(255),
                view_count INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        conn.commit()
        logger.info("数据库初始化完成！")
        return True

    except Exception as e:
        logger.error(f"初始化数据库时出错: {str(e)}")
        logger.error(traceback.format_exc())
        return False

    finally:
        if 'cur' in locals() and cur:
            cur.close()
        if 'conn' in locals() and conn:
            conn.close()

if __name__ == '__main__':
    try:
        if init_database():
            logger.info("数据库初始化成功！")
            sys.exit(0)
        else:
            logger.error("数据库初始化失败！")
            sys.exit(1)
    except Exception as e:
        logger.error(f"程序执行出错: {str(e)}")
        logger.error(traceback.format_exc())
        sys.exit(1)
