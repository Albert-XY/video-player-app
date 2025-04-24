#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import time
import json
import logging
import requests
from datetime import datetime, timedelta
import sqlite3
from config import VIDEO_CONFIG

# 设置日志
logging.basicConfig(
    format='%(asctime)s [%(name)s] %(levelname)s: %(message)s',
    level=logging.INFO
)
logger = logging.getLogger('bilibili_api_client')

class BilibiliApiClient:
    """
    Bilibili API客户端，用于获取视频信息
    使用官方API替代爬虫，遵循使用条款和请求限制
    """
    
    def __init__(self):
        # API配置
        self.base_url = "https://api.bilibili.com"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Referer': 'https://www.bilibili.com',
            'Accept': 'application/json',
        }
        
        # 读取API密钥（需要提前申请）
        self.appkey = os.getenv('BILIBILI_APPKEY', '')
        self.appsecret = os.getenv('BILIBILI_APPSECRET', '')
        
        # 请求限制
        self.request_interval = 10  # 请求间隔10秒
        self.daily_limit = 100  # 每日请求限制100次
        
        # 创建请求记录数据库
        self._init_request_tracker()
        
        # 上次请求时间
        self.last_request_time = 0
    
    def _init_request_tracker(self):
        """初始化请求计数器数据库"""
        db_path = os.path.join(os.path.dirname(__file__), 'cache', 'request_tracker.db')
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        
        self.db_conn = sqlite3.connect(db_path)
        cursor = self.db_conn.cursor()
        
        # 创建请求记录表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS request_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                endpoint TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        self.db_conn.commit()
    
    def _check_daily_limit(self):
        """检查是否超出每日请求限制"""
        cursor = self.db_conn.cursor()
        yesterday = datetime.now() - timedelta(days=1)
        yesterday_str = yesterday.strftime('%Y-%m-%d %H:%M:%S')
        
        cursor.execute('SELECT COUNT(*) FROM request_log WHERE timestamp > ?', (yesterday_str,))
        count = cursor.fetchone()[0]
        
        return count < self.daily_limit
    
    def _record_request(self, endpoint):
        """记录API请求"""
        cursor = self.db_conn.cursor()
        cursor.execute('INSERT INTO request_log (endpoint) VALUES (?)', (endpoint,))
        self.db_conn.commit()
    
    def _wait_for_next_request(self):
        """等待适当的时间间隔后再发起请求"""
        current_time = time.time()
        time_since_last_request = current_time - self.last_request_time
        
        if time_since_last_request < self.request_interval:
            wait_time = self.request_interval - time_since_last_request
            logger.info(f"等待 {wait_time:.2f} 秒后发起下一个请求...")
            time.sleep(wait_time)
        
        self.last_request_time = time.time()
    
    def get_popular_videos(self, pn=1, ps=20):
        """
        获取排行榜视频
        
        Args:
            pn: 页码，默认1
            ps: 每页数量，默认20
            
        Returns:
            符合时长要求的视频列表
        """
        endpoint = "/x/web-interface/ranking/v2"
        
        # 检查请求限制
        if not self._check_daily_limit():
            logger.warning("已达到每日请求限制（100次），请等待明天再试")
            return []
        
        self._wait_for_next_request()
        
        try:
            params = {
                'rid': 0,  # 分区ID，0表示全站
                'type': 'all',  # 类型
                'pn': pn,  # 页码
                'ps': ps,  # 每页数量
            }
            
            # 添加认证参数（如果有的话）
            if self.appkey and self.appsecret:
                params['appkey'] = self.appkey
                # 在实际使用中需要计算签名
            
            url = f"{self.base_url}{endpoint}"
            response = requests.get(url, params=params, headers=self.headers)
            
            # 记录请求
            self._record_request(endpoint)
            
            if response.status_code == 200:
                data = response.json()
                if data['code'] == 0:
                    videos = []
                    
                    for item in data['data']['list']:
                        bvid = item.get('bvid', '')
                        duration = item.get('duration', 0)
                        
                        # 如果duration是字符串形式的时间如"03:25"，需要转换
                        if isinstance(duration, str):
                            duration = self._parse_duration(duration)
                        
                        # 只收集时长符合要求的视频
                        if VIDEO_CONFIG['MIN_DURATION'] <= duration <= VIDEO_CONFIG['MAX_DURATION']:
                            video_url = f"https://www.bilibili.com/video/{bvid}"
                            videos.append({
                                'url': video_url,
                                'duration': duration
                            })
                    
                    logger.info(f"获取到 {len(videos)} 个符合条件的视频")
                    return videos
                else:
                    logger.error(f"API返回错误: {data['message']}")
            else:
                logger.error(f"请求失败, 状态码: {response.status_code}")
        
        except Exception as e:
            logger.error(f"获取排行榜视频失败: {str(e)}")
        
        return []
    
    def get_video_detail(self, bvid):
        """
        获取视频详细信息
        
        Args:
            bvid: 视频BV号
            
        Returns:
            视频详细信息
        """
        endpoint = "/x/web-interface/view"
        
        # 检查请求限制
        if not self._check_daily_limit():
            logger.warning("已达到每日请求限制（100次），请等待明天再试")
            return None
        
        self._wait_for_next_request()
        
        try:
            params = {'bvid': bvid}
            
            # 添加认证参数（如果有的话）
            if self.appkey and self.appsecret:
                params['appkey'] = self.appkey
            
            url = f"{self.base_url}{endpoint}"
            response = requests.get(url, params=params, headers=self.headers)
            
            # 记录请求
            self._record_request(endpoint)
            
            if response.status_code == 200:
                data = response.json()
                if data['code'] == 0:
                    return data['data']
                else:
                    logger.error(f"API返回错误: {data['message']}")
            else:
                logger.error(f"请求失败, 状态码: {response.status_code}")
        
        except Exception as e:
            logger.error(f"获取视频详情失败: {str(e)}")
        
        return None
    
    def _parse_duration(self, duration_str):
        """将时长字符串转换为秒数"""
        try:
            parts = duration_str.split(':')
            if len(parts) == 2:
                minutes, seconds = map(int, parts)
                return minutes * 60 + seconds
            elif len(parts) == 3:
                hours, minutes, seconds = map(int, parts)
                return hours * 3600 + minutes * 60 + seconds
            return 0
        except:
            return 0
    
    def close(self):
        """关闭数据库连接"""
        if hasattr(self, 'db_conn'):
            self.db_conn.close()


if __name__ == "__main__":
    # 示例用法
    client = BilibiliApiClient()
    try:
        # 获取符合条件的视频
        videos = client.get_popular_videos()
        
        print(f"找到 {len(videos)} 个符合条件的视频 (时长: {VIDEO_CONFIG['MIN_DURATION']}-{VIDEO_CONFIG['MAX_DURATION']}秒)")
        
        for i, video in enumerate(videos, 1):
            print(f"{i}. URL: {video['url']}, 时长: {video['duration']}秒")
            
            # 可以选择获取详细信息
            if i <= 3:  # 只获取前3个视频的详情
                bvid = video['url'].split('/')[-1]
                detail = client.get_video_detail(bvid)
                if detail:
                    print(f"   标题: {detail.get('title', '未知')}")
                    print(f"   UP主: {detail.get('owner', {}).get('name', '未知')}")
                    print(f"   播放量: {detail.get('stat', {}).get('view', 0)}")
        
    finally:
        client.close() 