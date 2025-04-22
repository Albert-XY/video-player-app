-- 更新后的数据库结构，与当前API实现匹配

-- 首先连接到默认数据库
\c postgres

-- 创建数据库（如果不存在）
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'video_player') THEN
        CREATE DATABASE video_player
        WITH OWNER = postgres
        ENCODING = 'UTF8'
        LC_COLLATE = 'Chinese (Simplified)_China.936'
        LC_CTYPE = 'Chinese (Simplified)_China.936'
        TEMPLATE template0;
    END IF;
END $$;

-- 连接到新创建的数据库
\c video_player

-- 删除旧的表（如果存在）
DROP TABLE IF EXISTS user_ratings;
DROP TABLE IF EXISTS videos;

-- 创建视频表（更新结构以匹配API需求）
CREATE TABLE videos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    src VARCHAR(512) NOT NULL,
    rvm_valence FLOAT DEFAULT 0.5,
    rvm_arousal FLOAT DEFAULT 0.5,
    sam_valence_avg FLOAT,
    sam_arousal_avg FLOAT,
    rating_count INTEGER DEFAULT 0,
    is_approved BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploader VARCHAR(100) DEFAULT 'system',
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建用户评分表
CREATE TABLE user_ratings (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    video_id INTEGER NOT NULL REFERENCES videos(id),
    sam_valence FLOAT NOT NULL,
    sam_arousal FLOAT NOT NULL,
    watch_duration INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建合格视频表，用于实验范式播放器
CREATE TABLE approved_videos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    src VARCHAR(512) NOT NULL,
    sam_valence_avg FLOAT NOT NULL,
    sam_arousal_avg FLOAT NOT NULL,
    rating_count INTEGER NOT NULL,
    original_video_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_videos_valence_arousal ON videos (rvm_valence, rvm_arousal);
CREATE INDEX idx_videos_upload_date ON videos (upload_date);
CREATE INDEX idx_videos_rating_count ON videos (rating_count);
CREATE INDEX idx_videos_is_approved ON videos (is_approved);
CREATE INDEX idx_videos_is_deleted ON videos (is_deleted);

CREATE INDEX idx_user_ratings_video_id ON user_ratings (video_id);
CREATE INDEX idx_user_ratings_user_id ON user_ratings (user_id);

CREATE INDEX idx_approved_videos_valence ON approved_videos (sam_valence_avg);
CREATE INDEX idx_approved_videos_arousal ON approved_videos (sam_arousal_avg);

-- 插入一些测试视频数据
INSERT INTO videos (title, src, rvm_valence, rvm_arousal) VALUES
('测试视频1', 'https://www.w3schools.com/html/mov_bbb.mp4', 0.5, 0.5),
('测试视频2', 'https://www.w3schools.com/html/movie.mp4', 0.5, 0.5), 
('测试视频3', 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4', 0.5, 0.5),
('测试视频4', 'https://download.samplelib.com/mp4/sample-5s.mp4', 0.5, 0.5),
('测试视频5', 'https://download.samplelib.com/mp4/sample-10s.mp4', 0.5, 0.5);

-- 确认创建成功
SELECT 'Database schema updated successfully!' AS message;
