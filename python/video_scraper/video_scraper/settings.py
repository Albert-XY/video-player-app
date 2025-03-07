BOT_NAME = 'video_scraper'

SPIDER_MODULES = ['video_scraper.spiders']
NEWSPIDER_MODULE = 'video_scraper.spiders'

USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'

ROBOTSTXT_OBEY = True

ITEM_PIPELINES = {
   'video_scraper.pipelines.MongoDBPipeline': 300,
}

MONGO_URI = 'mongodb://localhost:27017'
MONGO_DATABASE = 'video_db'

