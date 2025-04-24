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
        'ROBOTSTXT_OBEY': True,  # 修改为True，遵守robots.txt规则
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
                    # 只获取视频链接
                    video_url = response.urljoin(video.css('.title::attr(href)').get(''))
                    
                    if not video_url:
                        continue
                        
                    # 只获取时长
                    duration_str = video.css('.duration::text').get('0:00')
                    duration_seconds = self.parse_duration(duration_str)
                    
                    # 只保留视频链接和时长
                    item = VideoItem()
                    item['url'] = video_url
                    item['duration'] = duration_seconds
                    
                    # 只保留时长在150-210秒之间的视频
                    if 150 <= duration_seconds <= 210:
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

    def handle_error(self, failure):
        """处理请求错误"""
        logging.error(f"请求失败: {failure.request.url}")
        self.crawler.stats.inc_value('spider/request_errors')
