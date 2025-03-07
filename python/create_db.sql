DROP DATABASE IF EXISTS video_player;

CREATE DATABASE video_player
WITH OWNER = postgres
ENCODING = 'UTF8'
LC_COLLATE = 'Chinese (Simplified)_China.936'
LC_CTYPE = 'Chinese (Simplified)_China.936'
TEMPLATE template0;

\c video_player

CREATE TABLE videos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    src VARCHAR(512) NOT NULL,
    rvm_valence FLOAT,
    rvm_arousal FLOAT,
    upload_date TIMESTAMP,
    uploader VARCHAR(100),
    view_count INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_videos_valence_arousal ON videos (rvm_valence, rvm_arousal);
CREATE INDEX idx_videos_upload_date ON videos (upload_date);
