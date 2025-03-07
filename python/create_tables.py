# -*- coding: utf-8 -*-

from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String, Float, DateTime, Index
from sqlalchemy.sql import text
import logging
import sys
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

def create_tables():
    """Create the necessary tables in the database"""
    try:
        # Connect to PostgreSQL
        logger.info("Connecting to PostgreSQL...")
        engine = create_engine('postgresql://postgres:postgres@localhost:5432/postgres')
        
        # Create video_player database if not exists
        with engine.connect() as conn:
            conn.execute(text("COMMIT"))  # Close any open transactions
            conn.execute(text("""
                SELECT pg_terminate_backend(pg_stat_activity.pid)
                FROM pg_stat_activity
                WHERE pg_stat_activity.datname = 'video_player'
                AND pid <> pg_backend_pid();
            """))
            conn.execute(text("DROP DATABASE IF EXISTS video_player"))
            logger.info("Creating database...")
            conn.execute(text("""
                CREATE DATABASE video_player
                WITH OWNER = postgres
                ENCODING = 'UTF8'
                LC_COLLATE = 'Chinese (Simplified)_China.936'
                LC_CTYPE = 'Chinese (Simplified)_China.936'
                TEMPLATE template0;
            """))
            logger.info("Database created.")

        # Connect to video_player database
        logger.info("Connecting to video_player database...")
        engine = create_engine('postgresql://postgres:postgres@localhost:5432/video_player')
        metadata = MetaData()

        # Define tables
        videos = Table('videos', metadata,
            Column('id', Integer, primary_key=True),
            Column('title', String(255), nullable=False),
            Column('src', String(512), nullable=False),
            Column('rvm_valence', Float),
            Column('rvm_arousal', Float),
            Column('upload_date', DateTime),
            Column('uploader', String(100)),
            Column('view_count', Integer),
            Column('created_at', DateTime, default=datetime.utcnow)
        )

        # Create indexes
        Index('idx_videos_valence_arousal', videos.c.rvm_valence, videos.c.rvm_arousal)
        Index('idx_videos_upload_date', videos.c.upload_date)

        # Create all tables
        logger.info("Creating tables...")
        metadata.create_all(engine)
        logger.info("Tables created successfully!")

    except Exception as e:
        logger.error("Error: %s", str(e))

if __name__ == "__main__":
    create_tables()
