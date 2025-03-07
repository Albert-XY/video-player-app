import sqlite3
import os
import logging
import sys

# 配置日志输出
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# 显示数据库表结构
def show_db_schema(db_path):
    try:
        if not os.path.exists(db_path):
            logger.error(f"数据库文件不存在: {db_path}")
            return
            
        logger.info(f"分析数据库文件: {db_path}")
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # 获取所有表
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        if not tables:
            logger.warning(f"数据库 {db_path} 中没有表")
            return
        
        logger.info(f"数据库 {db_path} 包含 {len(tables)} 个表:")
        
        for table in tables:
            table_name = table[0]
            cursor.execute(f"PRAGMA table_info({table_name})")
            columns = cursor.fetchall()
            
            logger.info(f"表 '{table_name}' 的结构:")
            for col in columns:
                logger.info(f"  - {col[1]} ({col[2]})")
            
            # 获取记录数
            cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
            count = cursor.fetchone()[0]
            logger.info(f"  - 包含 {count} 条记录")
            
            # 显示示例数据
            if count > 0:
                cursor.execute(f"SELECT * FROM {table_name} LIMIT 3")
                rows = cursor.fetchall()
                logger.info(f"  - 示例数据:")
                for row in rows:
                    logger.info(f"    {row}")
                
            logger.info("-" * 50)
        
        conn.close()
    except Exception as e:
        logger.error(f"查询数据库 {db_path} 时出错: {e}")
        import traceback
        logger.error(traceback.format_exc())

# 主函数
def main():
    # 直接检查几个可能位置的数据库
    db_paths = [
        os.path.abspath('video_player.db'),
        os.path.abspath('python/video_player.db'),
        os.path.abspath('data/video_player.db'),
        os.path.abspath('../video_player.db'),
    ]
    
    for db_path in db_paths:
        show_db_schema(db_path)

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        logger.error(f"执行出错: {e}")
        import traceback
        logger.error(traceback.format_exc())
        sys.exit(1)
