from flask import Flask, request, jsonify
import sqlite3
import logging
import os
import random

app = Flask(__name__)

# 配置日志
logging.basicConfig(level=logging.INFO, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# 数据库路径
DB_FILE = os.path.abspath('video_player.db')
logger.info(f"使用数据库路径: {DB_FILE}")

# 允许跨域访问的装饰器
def add_cors_headers(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# 获取数据库连接
def get_db_connection():
    try:
        # 检查数据库文件是否存在
        if not os.path.exists(DB_FILE):
            logger.error(f"数据库文件不存在: {os.path.abspath(DB_FILE)}")
            raise FileNotFoundError(f"数据库文件不存在: {os.path.abspath(DB_FILE)}")
        
        conn = sqlite3.connect(DB_FILE)
        conn.row_factory = sqlite3.Row
        return conn
    except Exception as e:
        logger.error(f"数据库连接错误: {e}")
        raise

# 首页
@app.route('/')
def index():
    return jsonify({"message": "API服务器正在运行", "status": "ok"})

# 健康检查端点
@app.route('/api/health')
def health_check():
    return jsonify({"status": "ok", "message": "API服务器运行正常"})

# 创建前端Next.js API路由代理 - SAM评分
@app.route('/api/sam-ratings', methods=['POST', 'OPTIONS'])
def sam_ratings_proxy():
    if request.method == 'OPTIONS':
        response = jsonify({})
        return add_cors_headers(response)
    
    return submit_sam_rating()

# 获取视频列表
@app.route('/api/videos', methods=['GET'])
def get_videos():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT id, title, src 
            FROM videos 
            WHERE 
                (rating_count IS NULL OR rating_count < 16 OR is_approved IS NULL OR is_approved = 0)
            ORDER BY RANDOM() 
            LIMIT 10
        ''')
        videos = [dict(row) for row in cursor.fetchall()]
        cursor.close()
        conn.close()
        
        response = jsonify(videos)
        return add_cors_headers(response)
    except Exception as e:
        logger.error(f"获取视频列表出错: {str(e)}")
        response = jsonify({"error": "获取视频列表失败"})
        response.status_code = 500
        return add_cors_headers(response)

# 提交SAM评分
def submit_sam_rating():
    try:
        data = request.json
        logger.info(f"收到SAM评分提交: {data}")
        
        videoId = data.get('videoId')
        userId = data.get('userId')
        valence = data.get('valence')
        arousal = data.get('arousal')
        watchDuration = data.get('watchDuration', 0)
        
        if not videoId or not userId:
            logger.error(f"参数错误: 缺少视频ID或用户ID - videoId:{videoId}, userId:{userId}")
            response = jsonify({"error": "视频ID和用户ID为必填项"})
            response.status_code = 400
            return add_cors_headers(response)
        
        if valence is None or arousal is None:
            logger.error(f"参数错误: 缺少效价或唤醒度 - valence:{valence}, arousal:{arousal}")
            response = jsonify({"error": "效价(valence)和唤醒度(arousal)为必填项"})
            response.status_code = 400
            return add_cors_headers(response)
            
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 检查视频是否存在
        cursor.execute('SELECT id FROM videos WHERE id = ?', (videoId,))
        video_exists = cursor.fetchone()
        if not video_exists:
            logger.error(f"视频不存在: ID = {videoId}")
            response = jsonify({"error": "视频不存在"})
            response.status_code = 404
            return add_cors_headers(response)
        
        # 检查用户是否已经评价过该视频
        cursor.execute('SELECT id FROM user_ratings WHERE user_id = ? AND video_id = ?', (userId, videoId))
        existing_rating = cursor.fetchone()
        if existing_rating:
            logger.warning(f"用户 {userId} 已经评价过视频 {videoId}")
            # 更新已有的评分
            cursor.execute(
                'UPDATE user_ratings SET sam_valence = ?, sam_arousal = ?, watch_duration = ? WHERE user_id = ? AND video_id = ?',
                (valence, arousal, watchDuration, userId, videoId)
            )
            logger.info(f"更新了用户 {userId} 对视频 {videoId} 的评分")
        else:
            # 1. 保存新的用户评分
            cursor.execute(
                'INSERT INTO user_ratings (user_id, video_id, sam_valence, sam_arousal, watch_duration) VALUES (?, ?, ?, ?, ?)',
                (userId, videoId, valence, arousal, watchDuration)
            )
            logger.info(f"为用户 {userId} 添加了对视频 {videoId} 的新评分")
            
            # 2. 更新视频的评分计数
            cursor.execute(
                'UPDATE videos SET rating_count = COALESCE(rating_count, 0) + 1 WHERE id = ?',
                (videoId,)
            )
        
        # 3. 检查视频是否已达到评分阈值
        cursor.execute('SELECT rating_count FROM videos WHERE id = ?', (videoId,))
        video = cursor.fetchone()
        
        # 如果达到16个评分，进行SAM评估
        if video and video['rating_count'] >= 16:
            logger.info(f"视频 {videoId} 已收集到 {video['rating_count']} 个评分，开始SAM评估")
            
            # 计算平均SAM评分和方差
            cursor.execute(
                '''SELECT 
                    AVG(sam_valence) as avg_valence, 
                    AVG(sam_arousal) as avg_arousal, 
                    (SUM(sam_valence*sam_valence) / COUNT(*) - (SUM(sam_valence) / COUNT(*))*(SUM(sam_valence) / COUNT(*))) as var_valence, 
                    (SUM(sam_arousal*sam_arousal) / COUNT(*) - (SUM(sam_arousal) / COUNT(*))*(SUM(sam_arousal) / COUNT(*))) as var_arousal,
                    COUNT(*) as rating_count
                FROM user_ratings 
                WHERE video_id = ?''',
                (videoId,)
            )
            avgRatings = cursor.fetchone()
            
            if avgRatings:
                # 检查是否符合批准条件
                valence_deviation = abs(avgRatings['avg_valence'] - 0.5)
                arousal_deviation = abs(avgRatings['avg_arousal'] - 0.5)
                
                isApproved = (
                    # 情感明确性检查：效价或唤醒度至少有一个明确偏离中性
                    (valence_deviation > 0.2 or arousal_deviation > 0.2) and
                    # 评分者意见一致性检查：方差小于阈值
                    avgRatings['var_valence'] < 0.06 and avgRatings['var_arousal'] < 0.06
                )
                
                # 更新视频批准状态
                cursor.execute(
                    'UPDATE videos SET is_approved = ?, sam_valence_avg = ?, sam_arousal_avg = ? WHERE id = ?',
                    (1 if isApproved else 0, avgRatings['avg_valence'], avgRatings['avg_arousal'], videoId)
                )
                
                logger.info(f"视频 {videoId} SAM评估结果: " + 
                           f"平均效价={avgRatings['avg_valence']:.4f} (偏离={valence_deviation:.4f}), " +
                           f"平均唤醒度={avgRatings['avg_arousal']:.4f} (偏离={arousal_deviation:.4f}), " + 
                           f"效价方差={avgRatings['var_valence']:.4f}, 唤醒度方差={avgRatings['var_arousal']:.4f}, " +
                           f"审核结果={'通过' if isApproved else '拒绝'}")
        
        conn.commit()
        cursor.close()
        conn.close()
        
        response = jsonify({
            "success": True, 
            "message": "评分提交成功", 
            "videoId": videoId,
            "userId": userId,
            "valence": valence,
            "arousal": arousal
        })
        return add_cors_headers(response)
    except Exception as e:
        logger.error(f"提交SAM评分出错: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        response = jsonify({"error": "提交评分失败", "message": str(e)})
        response.status_code = 500
        return add_cors_headers(response)

# 获取视频统计信息
@app.route('/api/video-stats', methods=['GET'])
def get_video_stats():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT 
                id, 
                title, 
                COALESCE(rating_count, 0) as total_ratings,
                CASE 
                    WHEN is_approved = 1 THEN 'approved'
                    WHEN rating_count >= 16 AND is_approved = 0 THEN 'rejected'
                    ELSE 'pending'
                END as approval_status
            FROM videos
            ORDER BY 
                CASE 
                    WHEN rating_count IS NULL THEN 0
                    ELSE rating_count
                END DESC
            LIMIT 50
        ''')
        
        stats = [dict(row) for row in cursor.fetchall()]
        cursor.close()
        conn.close()
        
        response = jsonify(stats)
        return add_cors_headers(response)
    except Exception as e:
        logger.error(f"获取视频统计信息出错: {str(e)}")
        response = jsonify({"error": "获取视频统计信息失败"})
        response.status_code = 500
        return add_cors_headers(response)

# 允许处理OPTIONS请求（预检请求）
@app.route('/<path:path>', methods=['OPTIONS'])
def options_handler(path):
    response = jsonify({})
    return add_cors_headers(response)

if __name__ == '__main__':
    # 检查数据库是否存在
    if not os.path.exists(DB_FILE):
        logger.error(f"数据库文件不存在: {DB_FILE}")
        logger.info("请先运行 python -m python.sqlite_db 创建数据库")
    else:
        logger.info(f"使用数据库: {os.path.abspath(DB_FILE)}")
        
    # 启动服务器
    port = 8080
    logger.info(f"启动API服务器，端口: {port}")
    app.run(host='0.0.0.0', port=port, debug=True)
