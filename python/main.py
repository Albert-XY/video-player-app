from video_scraper.video_scraper.spiders.video_spider import VideoSpider
from scrapy.crawler import CrawlerProcess
from scrapy.utils.project import get_project_settings
from rvm_analysis import analyze_videos, predict_valence_arousal
import pymongo

def run_spider():
    process = CrawlerProcess(get_project_settings())
    process.crawl(VideoSpider)
    process.start()

def process_videos():
    client = pymongo.MongoClient('mongodb://localhost:27017')
    db = client['video_db']
    collection = db['raw_videos']

    video_paths = []
    valence_labels = []
    arousal_labels = []

    for video in collection.find():
        # 假设我们已经有了人工标注的valence和arousal值
        video_paths.append(video['url'])
        valence_labels.append(video['valence'])
        arousal_labels.append(video['arousal'])

    rvm_valence, rvm_arousal = analyze_videos(video_paths, valence_labels, arousal_labels)

    # 对新视频进行预测
    new_video_path = 'path/to/new/video.mp4'
    predicted_valence, predicted_arousal = predict_valence_arousal(rvm_valence, rvm_arousal, new_video_path)
    print(f"Predicted valence: {predicted_valence}, Predicted arousal: {predicted_arousal}")

if __name__ == "__main__":
    run_spider()
    process_videos()

