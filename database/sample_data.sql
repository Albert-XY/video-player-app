-- 视频播放器应用 - 示例数据SQL脚本
-- 使用方法: 
-- 1. 确保数据库已创建并且表结构已存在
-- 2. 运行此脚本插入示例数据

-- 清空现有数据（可选，谨慎使用）
-- TRUNCATE TABLE user_activities;
-- TRUNCATE TABLE playlist_videos;
-- TRUNCATE TABLE comments;
-- TRUNCATE TABLE playlists;
-- TRUNCATE TABLE videos;
-- TRUNCATE TABLE categories;
-- TRUNCATE TABLE users;

-- 插入用户数据
INSERT INTO users (username, email, password, full_name, is_admin, is_active, created_at, updated_at)
VALUES
('admin', 'admin@example.com', '$2a$10$X7VYCcwTwLzWGP.vC4qwnOeUFVUn8/fmpyD5jBUDTgNJULOqNZZm2', '管理员', true, true, NOW(), NOW()),
('user1', 'user1@example.com', '$2a$10$d5phCR1vEJ4rkPNjRkCxCOZZ1qzCzW6.ssTG9ldh0PIw0Qg1/TjFe', '测试用户1', false, true, NOW(), NOW()),
('user2', 'user2@example.com', '$2a$10$d5phCR1vEJ4rkPNjRkCxCOZZ1qzCzW6.ssTG9ldh0PIw0Qg1/TjFe', '测试用户2', false, true, NOW(), NOW()),
('videomaker', 'creator@example.com', '$2a$10$KfSUDCwQHFSvZ4KZGbQOduzZqTfLRIFV2hfNXL/pYQG3ywlpXM1WO', '视频创作者', false, true, NOW(), NOW()),
('commenter', 'comment@example.com', '$2a$10$jGiCB0ygMYZPpjvTiVjdjeV4vcJpnCWQCnQNTPgtLOTmY8aN/KUX.', '评论者', false, true, NOW(), NOW());
-- 注意: 以上密码哈希对应的明文密码分别是: admin123, user123, user123, creator123, comment123

-- 插入分类数据
INSERT INTO categories (name, description, created_at)
VALUES
('教育', '教育类视频', NOW()),
('娱乐', '娱乐类视频', NOW()),
('音乐', '音乐类视频', NOW()),
('科技', '科技类视频', NOW()),
('游戏', '游戏类视频', NOW()),
('体育', '体育类视频', NOW()),
('电影', '电影类视频', NOW()),
('动画', '动画类视频', NOW());

-- 插入视频数据
INSERT INTO videos (title, description, url, thumbnail, duration, views, rating, user_id, category_id, created_at, updated_at)
VALUES
('初学者Python教程 (1)', '本视频详细介绍了Python的基础知识，适合初学者。', 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4', 'https://via.placeholder.com/320x180?text=Video+Thumbnail+1', 300, 1250, 4.5, 1, 1, NOW() - INTERVAL '30 DAY', NOW()),
('高级JavaScript技巧 (2)', '深入探讨JavaScript的高级应用，提供实用技巧。', 'https://samplelib.com/lib/preview/mp4/sample-10s.mp4', 'https://via.placeholder.com/320x180?text=Video+Thumbnail+2', 450, 780, 4.2, 1, 1, NOW() - INTERVAL '25 DAY', NOW()),
('React框架入门到精通 (3)', '全面讲解React的核心概念和实际应用场景。', 'https://samplelib.com/lib/preview/mp4/sample-15s.mp4', 'https://via.placeholder.com/320x180?text=Video+Thumbnail+3', 600, 2100, 4.7, 4, 1, NOW() - INTERVAL '20 DAY', NOW()),
('Vue.js实战项目开发 (4)', '通过实际项目演示Vue.js的开发流程和最佳实践。', 'https://samplelib.com/lib/preview/mp4/sample-20s.mp4', 'https://via.placeholder.com/320x180?text=Video+Thumbnail+4', 750, 1800, 4.3, 4, 1, NOW() - INTERVAL '15 DAY', NOW()),
('数据结构与算法 (5)', '数据结构完整教程，从入门到精通的学习路径。', 'https://samplelib.com/lib/preview/mp4/sample-30s.mp4', 'https://via.placeholder.com/320x180?text=Video+Thumbnail+5', 900, 3200, 4.8, 1, 1, NOW() - INTERVAL '10 DAY', NOW()),
('机器学习基础 (6)', '解析机器学习中常见的问题和解决方案。', 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4', 'https://via.placeholder.com/320x180?text=Video+Thumbnail+6', 1200, 2500, 4.6, 4, 4, NOW() - INTERVAL '9 DAY', NOW()),
('深度学习实战 (7)', '剖析深度学习的底层原理和实现机制。', 'https://file-examples.com/storage/fe8c7eef0c6364f6c9504cc/2017/04/file_example_MP4_480_1_5MG.mp4', 'https://via.placeholder.com/320x180?text=Video+Thumbnail+7', 1500, 1900, 4.4, 4, 4, NOW() - INTERVAL '8 DAY', NOW()),
('Web前端开发最佳实践 (8)', 'Web专业指南，帮助你快速掌握关键技能。', 'https://file-examples.com/storage/fe8c7eef0c6364f6c9504cc/2017/04/file_example_MP4_640_3MG.mp4', 'https://via.placeholder.com/320x180?text=Video+Thumbnail+8', 1800, 1600, 4.2, 1, 1, NOW() - INTERVAL '7 DAY', NOW()),
('后端开发技术栈 (9)', '探索后端的前沿发展和未来趋势。', 'https://file-examples.com/storage/fe8c7eef0c6364f6c9504cc/2017/04/file_example_MP4_1280_10MG.mp4', 'https://via.placeholder.com/320x180?text=Video+Thumbnail+9', 2100, 1400, 4.0, 1, 1, NOW() - INTERVAL '6 DAY', NOW()),
('DevOps与CI/CD (10)', 'DevOps实战案例分析，提升实际开发能力。', 'https://file-examples.com/storage/fe8c7eef0c6364f6c9504cc/2017/04/file_example_MP4_1920_18MG.mp4', 'https://via.placeholder.com/320x180?text=Video+Thumbnail+10', 2400, 1100, 3.9, 4, 4, NOW() - INTERVAL '5 DAY', NOW());

-- 插入评论数据
INSERT INTO comments (content, user_id, video_id, created_at)
VALUES
('很棒的视频，学到了很多！', 2, 1, NOW() - INTERVAL '29 DAY'),
('讲解非常清晰，谢谢分享。', 3, 1, NOW() - INTERVAL '28 DAY'),
('内容有点深奥，希望能有更详细的解释。', 5, 1, NOW() - INTERVAL '27 DAY'),
('这个主题很有意思，期待更多相关内容。', 2, 2, NOW() - INTERVAL '24 DAY'),
('视频质量很高，音质也不错。', 3, 2, NOW() - INTERVAL '23 DAY'),
('讲得太快了，希望能放慢一点。', 5, 3, NOW() - INTERVAL '19 DAY'),
('非常实用的知识点，已经收藏了。', 2, 3, NOW() - INTERVAL '18 DAY'),
('这个例子很好地说明了核心概念。', 3, 4, NOW() - INTERVAL '14 DAY'),
('希望能有更多的实际案例分析。', 5, 4, NOW() - INTERVAL '13 DAY'),
('讲解方式很生动，容易理解。', 2, 5, NOW() - INTERVAL '9 DAY');

-- 插入播放列表数据
INSERT INTO playlists (name, description, user_id, created_at, updated_at)
VALUES
('学习清单', 'user1创建的学习视频集合', 2, NOW() - INTERVAL '20 DAY', NOW()),
('技术收藏', 'user2创建的技术视频集合', 3, NOW() - INTERVAL '15 DAY', NOW()),
('创作参考', 'videomaker创建的参考视频集合', 4, NOW() - INTERVAL '10 DAY', NOW());

-- 添加视频到播放列表
INSERT INTO playlist_videos (playlist_id, video_id)
VALUES
(1, 1), (1, 2), (1, 5),
(2, 3), (2, 6), (2, 7), (2, 10),
(3, 4), (3, 8), (3, 9);

-- 插入用户活动数据
INSERT INTO user_activities (user_id, video_id, activity_type, created_at)
VALUES
(2, 1, 'view', NOW() - INTERVAL '29 DAY'),
(2, 1, 'like', NOW() - INTERVAL '29 DAY'),
(2, 2, 'view', NOW() - INTERVAL '24 DAY'),
(2, 5, 'view', NOW() - INTERVAL '9 DAY'),
(2, 5, 'share', NOW() - INTERVAL '9 DAY'),
(3, 1, 'view', NOW() - INTERVAL '28 DAY'),
(3, 2, 'view', NOW() - INTERVAL '23 DAY'),
(3, 2, 'save', NOW() - INTERVAL '23 DAY'),
(3, 3, 'view', NOW() - INTERVAL '18 DAY'),
(3, 6, 'view', NOW() - INTERVAL '8 DAY'),
(3, 6, 'like', NOW() - INTERVAL '8 DAY'),
(4, 3, 'view', NOW() - INTERVAL '19 DAY'),
(4, 4, 'view', NOW() - INTERVAL '14 DAY'),
(4, 7, 'view', NOW() - INTERVAL '7 DAY'),
(4, 10, 'view', NOW() - INTERVAL '4 DAY'),
(5, 1, 'view', NOW() - INTERVAL '27 DAY'),
(5, 3, 'view', NOW() - INTERVAL '19 DAY'),
(5, 4, 'view', NOW() - INTERVAL '13 DAY'),
(5, 4, 'like', NOW() - INTERVAL '13 DAY'),
(5, 8, 'view', NOW() - INTERVAL '6 DAY');
