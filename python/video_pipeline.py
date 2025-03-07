import os
import json
import subprocess
from scrapy.crawler import CrawlerProcess
from video_scraper.video_scraper.spiders.video_spider import VideoSpider
from video_processor import process_video, train_rvm
import psycopg2
from psycopg2 import sql
import numpy as np

# Database connection
conn = psycopg2.connect(
    dbname="your_db_name",
    user="your_username",
    password="your_password",
    host="your_host"
)
cur = conn.cursor()

def scrape_videos():
    process = CrawlerProcess()
    process.crawl(VideoSpider)
    process.start()

def download_video(url, output_path):
    subprocess.run(["youtube-dl", "-o", output_path, url])

def main():
    # Scrape videos
    scrape_videos()

    # Load scraped data
    with open('scraped_videos.json', 'r') as f:
        videos = json.load(f)

    # Train RVM models (you'd need labeled data for this in a real scenario)
    X_train = np.random.rand(1000, 100)
    y_valence = np.random.rand(1000)
    y_arousal = np.random.rand(1000)

    valence_rvm = train_rvm(X_train, y_valence)
    arousal_rvm = train_rvm(X_train, y_arousal)

    threshold = 1.0  # Adjust this value as needed

    for video in videos:
        # Download video
        output_path = f"downloads/{video['title']}.mp4"
        download_video(video['url'], output_path)

        # Process video
        should_keep, valence, arousal = process_video(output_path, valence_rvm, arousal_rvm, threshold)

        if should_keep:
            # Insert into database
            cur.execute(
                sql.SQL("INSERT INTO videos (title, src, rvm_valence, rvm_arousal) VALUES (%s, %s, %s, %s)"),
                (video['title'], video['url'], valence, arousal)
            )
            conn.commit()

        # Clean up downloaded file
        os.remove(output_path)

    cur.close()
    conn.close()

if __name__ == "__main__":
    main()

