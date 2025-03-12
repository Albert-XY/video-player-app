# -*- coding: utf-8 -*-
import scrapy
from video_scraper.items import VideoItem
from scrapy.loader import ItemLoader
from scrapy.exceptions import DropItem
from config import SPIDER_SETTINGS, VIDEO_CONFIG
import logging

import re
import json
from datetime import datetime

class VideoSpider(scrapy.Spider):
    name = 'video_spider'
    allowed_domains = SPIDER_SETTINGS['ALLOWED_DOMAINS']
    start_urls = SPIDER_SETTINGS['START_URLS']
    
    custom_settings = {
        'DOWNLOAD_DELAY': SPIDER_SETTINGS['DOWNLOAD_DELAY'],
        'CONCURRENT_REQUESTS': SPIDER_SETTINGS['CONCURRENT_REQUESTS'],
        'USER_AGENT': SPIDER_SETTINGS['USER_AGENT'],
        'RETRY_TIMES': SPIDER_SETTINGS['RETRY_TIMES'],
        'RETRY_HTTP_CODES': SPIDER_SETTINGS['RETRY_HTTP_CODES'],
        'COOKIES_ENABLED': SPIDER_SETTINGS['COOKIES_ENABLED'],
        'ROBOTSTXT_OBEY': SPIDER_SETTINGS['ROBOTSTXT_OBEY'],
        'DEFAULT_REQUEST_HEADERS': SPIDER_SETTINGS['DEFAULT_REQUEST_HEADERS'],
    }

    def start_requests(self):
        for url in self.start_urls:
            yield scrapy.Request(
                url=url,
                callback=self.parse,
                errback=self.handle_error,
                dont_filter=True,
                meta={'dont_redirect': True, 'handle_httpstatus_list': [302]}
            )

    def parse(self, response):
        try:
            # 提取排行榜视频信息
            for video in response.css('.rank-item'):
                try:
                    # 获取视频链接和标题
                    video_url = response.urljoin(video.css('.title::attr(href)').get(''))
                    title = video.css('.title::text').get('').strip()
                    
                    if not video_url or not title:
                        continue
                        
                    # 获取UP主信息
                    uploader = video.css('.up-name::text').get('').strip()
                    
                    # 获取播放量
                    view_count_str = video.css('.detail-state span:first-child::text').get('0')
                    view_count = self.parse_number(view_count_str)
                    
                    # 获取时长
                    duration = video.css('.duration::text').get('0:00')
                    
                    # 构建item
                    item = VideoItem()
                    item['title'] = title
                    item['url'] = video_url
                    item['duration'] = duration
                    item['uploader'] = uploader
                    item['upload_date'] = datetime.now().isoformat()
                    item['view_count'] = view_count
                    
                    if self.validate_item(item):
                        yield item
                    
                except Exception as e:
                    logging.error(f"解析视频项时出错: {str(e)}")
                    continue

            # 处理分页（如果有的话）
            next_page = response.css('.next-page::attr(href)').get()
            if next_page:
                yield response.follow(
                    next_page,
                    callback=self.parse,
                    errback=self.handle_error
                )
                
        except Exception as e:
            logging.error(f"解析页面 {response.url} 时出错: {str(e)}")
            self.crawler.stats.inc_value('spider/parse_errors')

    def validate_item(self, item):
        """验证爬取的视频项是否符合要求"""
        try:
            if not item.get('title') or not item.get('url'):
                return False
                
            duration = self.parse_duration(item.get('duration', '0:00'))
            if not (VIDEO_CONFIG['MIN_DURATION'] <= duration <= VIDEO_CONFIG['MAX_DURATION']):
                return False
                
            return True
        except Exception as e:
            logging.error(f"验证视频项时出错: {str(e)}")
            return False

    def parse_duration(self, duration_str):
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
            
    def parse_number(self, number_str):
        """解析数字（支持中文数字和单位）"""
        try:
            number_str = number_str.strip().lower()
            if '万' in number_str:
                return int(float(re.findall(r'[\d.]+', number_str)[0]) * 10000)
            elif '亿' in number_str:
                return int(float(re.findall(r'[\d.]+', number_str)[0]) * 100000000)
            else:
                return int(float(re.findall(r'[\d.]+', number_str)[0]))
        except:
            return 0

    def handle_error(self, failure):
        """处理请求错误"""
        logging.error(f"请求失败: {failure.request.url}")
        self.crawler.stats.inc_value('spider/request_errors')
