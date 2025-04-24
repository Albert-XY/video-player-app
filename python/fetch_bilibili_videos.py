#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
使用Bilibili API获取视频信息并存储到数据库
替代原有的爬虫方案，更加合规和高效
"""

import os
import sys
import logging
import argparse
import psycopg2
import sqlite3
from datetime import datetime
from config import DB_CONFIG, SQLITE_CONFIG, VIDEO_CONFIG
from bilibili_api_client import BilibiliApiClient

# 设置日志
logging.basicConfig(
    format='%(asctime)s [%(name)s] %(levelname)s: %(message)s',
    level=logging.INFO,
    handlers=[
        logging.FileHandler("bilibili_fetcher.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('bilibili_video_fetcher')

def init_database():
    """初始化数据库连接"""
    if SQLITE_CONFIG['use_sqlite']:
        # 使用SQLite
        db_path = SQLITE_CONFIG['db_file']
        logger.info(f"使用SQLite数据库: {db_path}")
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
    else:
        # 使用PostgreSQL
        logger.info(f"连接PostgreSQL数据库: {DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['dbname']}")
        conn = psycopg2.connect(
            dbname=DB_CONFIG['dbname'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password'],
            host=DB_CONFIG['host'],
            port=DB_CONFIG['port']
        )
        conn.autocommit = True

    return conn

def create_tables(conn):
    """创建必要的数据库表"""
    cursor = conn.cursor()
    
    # 检查是否使用SQLite
    if SQLITE_CONFIG['use_sqlite']:
        # 视频表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS videos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT,
                url TEXT UNIQUE,
                duration INTEGER,
                insert_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
    else:
        # PostgreSQL版本
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS videos (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255),
                url VARCHAR(255) UNIQUE,
                duration INTEGER,
                insert_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
    
    conn.commit()
    cursor.close()

def store_videos(conn, videos):
    """将视频信息存储到数据库"""
    cursor = conn.cursor()
    inserted_count = 0
    
    for video in videos:
        try:
            # 只插入URL和时长
            cursor.execute(
                "INSERT INTO videos (url, duration) VALUES (%s, %s) ON CONFLICT (url) DO NOTHING",
                (video['url'], video['duration'])
            )
            
            if cursor.rowcount > 0:
                inserted_count += 1
        except Exception as e:
            logger.error(f"插入视频记录失败: {str(e)}")
    
    conn.commit()
    cursor.close()
    
    return inserted_count

def get_unrated_video_count(conn):
    """获取未评分视频数量"""
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT COUNT(*) as count FROM videos 
        WHERE rating_count IS NULL OR rating_count < %s
    """, (16,))  # 假设每个视频需要至少16个评分
    
    result = cursor.fetchone()
    count = result[0] if result else 0
    cursor.close()
    
    return count

def main():
    # 命令行参数解析
    parser = argparse.ArgumentParser(description='获取Bilibili视频')
    parser.add_argument('--max-pages', type=int, default=5, help='最大抓取页数')
    parser.add_argument('--dry-run', action='store_true', help='不保存到数据库，仅打印结果')
    
    args = parser.parse_args()
    
    # 创建API客户端
    client = BilibiliApiClient()
    
    try:
        # 初始化数据库
        if not args.dry_run:
            conn = init_database()
            create_tables(conn)
            
            # 检查未评分视频数量
            unrated_count = get_unrated_video_count(conn)
            if unrated_count >= 40:  # 最大未评分视频数
                logger.info(f"未评分视频已达上限({unrated_count}/40)，不再获取新视频")
                return
            
            logger.info(f"当前未评分视频数量: {unrated_count}/40, 继续获取新视频")
        
        total_videos = []
        total_pages = args.max_pages
        
        # 获取多页视频
        for page in range(1, total_pages + 1):
            logger.info(f"正在获取第 {page}/{total_pages} 页视频...")
            videos = client.get_popular_videos(pn=page, ps=20)
            
            if not videos:
                logger.info(f"第 {page} 页没有符合条件的视频，停止获取")
                break
            
            total_videos.extend(videos)
            logger.info(f"已获取 {len(total_videos)} 个符合条件的视频 (时长: {VIDEO_CONFIG['MIN_DURATION']}-{VIDEO_CONFIG['MAX_DURATION']}秒)")
            
            # 达到100个视频后停止
            if len(total_videos) >= 100:
                logger.info("已达到100个视频的限制，停止获取")
                total_videos = total_videos[:100]  # 只保留前100个
                break
        
        # 输出结果
        logger.info(f"总共找到 {len(total_videos)} 个符合条件的视频")
        
        # 保存到数据库
        if not args.dry_run and total_videos:
            inserted_count = store_videos(conn, total_videos)
            logger.info(f"成功存储 {inserted_count} 个新视频到数据库")
        
    except Exception as e:
        logger.error(f"获取视频失败: {str(e)}")
    finally:
        # 关闭客户端和数据库连接
        client.close()
        if not args.dry_run and 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    main() 