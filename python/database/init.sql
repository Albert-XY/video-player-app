-- 初始化数据库结构

-- 创建users表
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建videos表
CREATE TABLE IF NOT EXISTS videos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_path VARCHAR(255) NOT NULL,
    thumbnail_path VARCHAR(255),
    duration FLOAT,
    width INTEGER,
    height INTEGER,
    format VARCHAR(50),
    size_bytes BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建video_features表
CREATE TABLE IF NOT EXISTS video_features (
    id SERIAL PRIMARY KEY,
    video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
    feature_type VARCHAR(50) NOT NULL,
    feature_value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建sam_ratings表
CREATE TABLE IF NOT EXISTS sam_ratings (
    id SERIAL PRIMARY KEY,
    video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    valence INTEGER NOT NULL,
    arousal INTEGER NOT NULL,
    dominance INTEGER NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(video_id, user_id)
);

-- 创建experiments表
CREATE TABLE IF NOT EXISTS experiments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建experiment_videos表
CREATE TABLE IF NOT EXISTS experiment_videos (
    id SERIAL PRIMARY KEY,
    experiment_id INTEGER REFERENCES experiments(id) ON DELETE CASCADE,
    video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
    display_order INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(experiment_id, video_id)
);

-- 创建索引提升查询性能
CREATE INDEX IF NOT EXISTS idx_videos_title ON videos(title);
CREATE INDEX IF NOT EXISTS idx_video_features_video_id ON video_features(video_id);
CREATE INDEX IF NOT EXISTS idx_video_features_type ON video_features(feature_type);
CREATE INDEX IF NOT EXISTS idx_sam_ratings_video_id ON sam_ratings(video_id);
CREATE INDEX IF NOT EXISTS idx_sam_ratings_user_id ON sam_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_experiment_videos_experiment_id ON experiment_videos(experiment_id);
CREATE INDEX IF NOT EXISTS idx_experiment_videos_video_id ON experiment_videos(video_id);

-- 插入测试数据
INSERT INTO users (username, email, password_hash) 
VALUES ('testuser', 'test@example.com', '$2b$12$1234567890123456789012') 
ON CONFLICT (username) DO NOTHING;

-- 插入样本视频数据
INSERT INTO videos (title, description, file_path, duration, width, height, format, size_bytes) 
VALUES 
('测试视频1', '这是一个测试视频', '/data/videos/test1.mp4', 120.5, 1920, 1080, 'mp4', 15728640),
('测试视频2', '另一个测试视频', '/data/videos/test2.mp4', 85.2, 1280, 720, 'mp4', 10485760)
ON CONFLICT DO NOTHING;
