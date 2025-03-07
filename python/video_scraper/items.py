# -*- coding: utf-8 -*-
import scrapy

class VideoItem(scrapy.Item):
    title = scrapy.Field()
    url = scrapy.Field()
    duration = scrapy.Field()
    uploader = scrapy.Field()
    upload_date = scrapy.Field()
    view_count = scrapy.Field()
