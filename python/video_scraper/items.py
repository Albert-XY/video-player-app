# -*- coding: utf-8 -*-
import scrapy

class VideoItem(scrapy.Item):
    url = scrapy.Field()
    duration = scrapy.Field()
