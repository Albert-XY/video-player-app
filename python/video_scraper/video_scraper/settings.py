BOT_NAME = 'video_scraper'

SPIDER_MODULES = ['video_scraper.spiders']
NEWSPIDER_MODULE = 'video_scraper.spiders'

USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'

ROBOTSTXT_OBEY = True

ITEM_PIPELINES = {
   'video_scraper.pipelines.MongoDBPipeline': 300,
}

import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()
load_dotenv('.env.local', override=True)

# 使用环境变量配置MongoDB
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017')
MONGO_DATABASE = os.getenv('MONGO_DB', 'video_db')

# 定义下载目录
# 使用绝对路径，确保服务器上路径正确
BASE_DIR = os.path.abspath(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
DOWNLOAD_PATH = os.getenv('DOWNLOAD_PATH', os.path.join(BASE_DIR, 'downloads'))

# 确保目录存在
for directory in [DOWNLOAD_PATH]:
    if not os.path.exists(directory):
        os.makedirs(directory)

