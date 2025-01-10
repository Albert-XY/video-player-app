import scrapy
from video_scraper.items import VideoItem
from scrapy.loader import ItemLoader

class VideoSpider(scrapy.Spider):
    name = 'video_spider'
    allowed_domains = ['example.com']  # 替换为实际的目标网站
    start_urls = ['https://example.com/videos']  # 替换为实际的起始URL

    def parse(self, response):
        for video in response.css('div.video-item'):
            loader = ItemLoader(item=VideoItem(), selector=video)
            loader.add_css('title', 'h2.video-title::text')
            loader.add_css('url', 'a.video-link::attr(href)')
            loader.add_css('duration', 'span.video-duration::text')
            yield loader.load_item()

        next_page = response.css('a.next-page::attr(href)').get()
        if next_page is not None:
            yield response.follow(next_page, self.parse)

