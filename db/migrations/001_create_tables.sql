-- Create videos table
CREATE TABLE videos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    src VARCHAR(255) NOT NULL,
    rvm_valence FLOAT,
    rvm_arousal FLOAT,
    rating_count INT DEFAULT 0,
    is_approved BOOLEAN DEFAULT FALSE
);

-- Create user_ratings table
CREATE TABLE user_ratings (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    video_id INT REFERENCES videos(id),
    sam_valence INT,
    sam_arousal INT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create video_views table
CREATE TABLE video_views (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    video_id INT REFERENCES videos(id),
    start_time TIMESTAMP,
    end_time TIMESTAMP
);

