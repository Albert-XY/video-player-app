import scrapy

class VideoItem(scrapy.Item):
    title = scrapy.Field()
    url = scrapy.Field()
    duration = scrapy.Field()

