#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import sys
import logging
from scrapy.crawler import CrawlerProcess
from scrapy.utils.project import get_project_settings
from dotenv import load_dotenv
import argparse

# 设置日志
logging.basicConfig(
    format='%(asctime)s [%(name)s] %(levelname)s: %(message)s',
    level=logging.INFO
)
logger = logging.getLogger('video_spider_runner')

def setup_environment():
    """设置环境变量并确保所需目录存在"""
    # 添加当前目录及video_scraper到PYTHONPATH
    current_dir = os.path.dirname(os.path.abspath(__file__))
    sys.path.append(current_dir)
    sys.path.append(os.path.join(current_dir, 'video_scraper'))
    
    # 加载环境变量
    load_dotenv()
    load_dotenv('.env.local', override=True)
    
    # 确保所需目录存在
    downloads_dir = os.path.join(current_dir, 'downloads')
    temp_dir = os.path.join(current_dir, 'temp')
    cache_dir = os.path.join(current_dir, 'cache')
    
    for directory in [downloads_dir, temp_dir, cache_dir]:
        if not os.path.exists(directory):
            os.makedirs(directory)
            logger.info(f"创建目录: {directory}")

def run_spider(mongo_uri=None, mongo_db=None):
    """运行视频爬虫"""
    try:
        # 导入系统配置和数据库连接
        import psycopg2
        from psycopg2.extras import DictCursor
        from config import DB_CONFIG, SAM_RATING_CONFIG
        
        # 检查未评分视频数量
        try:
            # 连接PostgreSQL数据库
            conn = psycopg2.connect(
                dbname=DB_CONFIG['dbname'],
                user=DB_CONFIG['user'],
                password=DB_CONFIG['password'],
                host=DB_CONFIG['host'],
                port=DB_CONFIG['port']
            )
            conn.autocommit = True
            cursor = conn.cursor(cursor_factory=DictCursor)
            
            # 查询未评分视频或评分不足的视频数量
            cursor.execute("""
                SELECT COUNT(*) as count FROM videos 
                WHERE rating_count IS NULL OR rating_count < %s
            """, (SAM_RATING_CONFIG['MIN_RATINGS_PER_VIDEO'],))
            
            result = cursor.fetchone()
            unrated_count = result['count'] if result else 0
            cursor.close()
            conn.close()
            
            # 如果未评分视频已达上限，则不启动爬虫
            if unrated_count >= SAM_RATING_CONFIG['MAX_UNRATED_VIDEOS']:
                logger.info(f"未评分视频已达上限({unrated_count}/{SAM_RATING_CONFIG['MAX_UNRATED_VIDEOS']})，暂停爬取")
                return False
                
            logger.info(f"当前未评分视频数量: {unrated_count}/{SAM_RATING_CONFIG['MAX_UNRATED_VIDEOS']}, 可以继续爬取")
            
        except Exception as e:
            logger.warning(f"检查未评分视频数量时出错: {str(e)}，将继续爬取")
        
        # 导入视频爬虫
        from video_scraper.spiders.video_spider import VideoSpider
        
        # 获取项目设置
        settings = get_project_settings()
        
        # 如果指定了MongoDB URI和数据库名，则覆盖默认设置
        if mongo_uri:
            settings['MONGO_URI'] = mongo_uri
        if mongo_db:
            settings['MONGO_DATABASE'] = mongo_db
            
        # 日志配置
        settings['LOG_LEVEL'] = 'INFO'
        settings['LOG_FILE'] = 'video_spider.log'
        
        # 创建爬虫进程
        process = CrawlerProcess(settings)
        
        # 添加视频爬虫
        process.crawl(VideoSpider)
        
        logger.info("开始运行视频爬虫...")
        # 开始爬取
        process.start()
        
        logger.info("视频爬虫运行完成!")
        return True
    except Exception as e:
        logger.error(f"运行爬虫失败: {str(e)}")
        return False

if __name__ == "__main__":
    # 命令行参数解析
    parser = argparse.ArgumentParser(description='运行视频爬虫')
    parser.add_argument('--mongo-uri', type=str, help='MongoDB URI，例如: mongodb://user:pass@host:port')
    parser.add_argument('--mongo-db', type=str, help='MongoDB数据库名')
    
    args = parser.parse_args()
    
    # 设置环境
    setup_environment()
    
    # 运行爬虫
    run_spider(mongo_uri=args.mongo_uri, mongo_db=args.mongo_db)
