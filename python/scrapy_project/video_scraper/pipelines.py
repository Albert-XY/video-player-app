# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://docs.scrapy.org/en/latest/topics/item-pipeline.html

import psycopg2

class VideoScraperPipeline:
    def __init__(self):
        self.connection = psycopg2.connect(
            host='localhost',
            database='your_database',
            user='your_username',
            password='your_password'
        )
        self.cur = self.connection.cursor()

    def process_item(self, item, spider):
        # Insert the video data into the database
        self.cur.execute(
            "INSERT INTO videos (title, url, duration) VALUES (%s, %s, %s)",
            (item['title'], item['url'], item['duration'])
        )
        self.connection.commit()
        return item

    def close_spider(self, spider):
        self.cur.close()
        self.connection.close()

