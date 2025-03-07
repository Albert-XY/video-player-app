#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import time
import logging
import psycopg2
from psycopg2 import sql

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("db_init.log")
    ]
)

logger = logging.getLogger("db_initializer")

def wait_for_postgres(host, port, user, password, dbname, max_retries=30, retry_interval=2):
    """等待PostgreSQL数据库准备就绪"""
    retry_count = 0
    
    while retry_count < max_retries:
        try:
            conn = psycopg2.connect(
                host=host,
                port=port,
                user=user,
                password=password,
                dbname=dbname
            )
            conn.close()
            logger.info("Successfully connected to PostgreSQL")
            return True
        except psycopg2.OperationalError as e:
            retry_count += 1
            logger.warning(f"Attempt {retry_count}/{max_retries} - Cannot connect to PostgreSQL: {e}")
            time.sleep(retry_interval)
    
    logger.error(f"Failed to connect to PostgreSQL after {max_retries} attempts")
    return False

def initialize_database(host, port, user, password, dbname, sql_path):
    """从SQL文件初始化数据库"""
    try:
        # 连接到数据库
        conn = psycopg2.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            dbname=dbname
        )
        conn.autocommit = True  # 自动提交事务
        cursor = conn.cursor()
        
        # 读取并执行SQL脚本
        logger.info(f"Reading SQL file: {sql_path}")
        with open(sql_path, 'r', encoding='utf-8') as sql_file:
            sql_script = sql_file.read()
        
        logger.info("Executing SQL script...")
        cursor.execute(sql_script)
        
        logger.info("Database initialization completed successfully")
        
        # 关闭连接
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        return False

if __name__ == "__main__":
    # 从环境变量获取数据库配置
    db_host = os.environ.get("DB_HOST", "db")
    db_port = os.environ.get("DB_PORT", "5432")
    db_user = os.environ.get("POSTGRES_USER", "postgres")
    db_password = os.environ.get("POSTGRES_PASSWORD", "postgres")
    db_name = os.environ.get("POSTGRES_DB", "video_player")
    
    # SQL脚本路径
    sql_path = os.path.join(os.path.dirname(__file__), "init.sql")
    
    logger.info("Starting database initialization process...")
    
    # 等待数据库准备就绪
    if wait_for_postgres(db_host, db_port, db_user, db_password, db_name):
        # 初始化数据库
        if initialize_database(db_host, db_port, db_user, db_password, db_name, sql_path):
            logger.info("Database initialization process completed")
        else:
            logger.error("Database initialization failed")
            exit(1)
    else:
        logger.error("Could not connect to database, initialization aborted")
        exit(1)
