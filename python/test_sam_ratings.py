import sqlite3
import random
import time
import logging
import sys
import os

# 配置日志输出
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('sam_test.log', encoding='utf-8')
    ]
)
logger = logging.getLogger(__name__)

# 数据库文件路径
DB_FILE = 'video_player.db'

def get_db_connection():
    """获取数据库连接"""
    if not os.path.exists(DB_FILE):
        logger.error(f"数据库文件不存在: {DB_FILE}")
        sys.exit(1)
        
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def simulate_sam_ratings():
    """模拟用户提交SAM评分，测试验证逻辑"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # 获取所有视频
        cursor.execute("SELECT id, title, rating_count FROM videos")
        videos = cursor.fetchall()
        
        if not videos:
            logger.error("数据库中没有视频数据")
            return
            
        # 打印数据库中的视频列表
        logger.info(f"数据库中有 {len(videos)} 个视频:")
        for video in videos:
            logger.info(f"  ID: {video['id']}, 标题: {video['title']}, 当前评分数: {video['rating_count'] or 0}")
        
        # 选择第一个视频进行测试
        test_video = videos[0]
        
        # 模拟4种不同类型的情感评分场景
        logger.info(f"\n开始对视频 '{test_video['title']}' (ID:{test_video['id']}) 进行测试")
        
        # 1. 高效价、低唤醒 (积极平静)
        simulate_ratings(conn, test_video['id'], 'high_valence_low_arousal', 16, (0.7, 0.8), (0.2, 0.3))
        
        # 2. 高效价、高唤醒 (积极兴奋)
        simulate_ratings(conn, test_video['id'], 'high_valence_high_arousal', 16, (0.7, 0.8), (0.7, 0.8))
        
        # 3. 低效价、低唤醒 (消极平静)
        simulate_ratings(conn, test_video['id'], 'low_valence_low_arousal', 16, (0.2, 0.3), (0.2, 0.3))
        
        # 4. 低效价、高唤醒 (消极兴奋)
        simulate_ratings(conn, test_video['id'], 'low_valence_high_arousal', 16, (0.2, 0.3), (0.7, 0.8))
        
        # 5. 中性
        simulate_ratings(conn, test_video['id'], 'neutral', 16, (0.4, 0.6), (0.4, 0.6))
        
        # 6. 高方差（不一致评价）
        simulate_ratings(conn, test_video['id'], 'high_variance', 16, (0.1, 0.9), (0.1, 0.9))
        
        # 检查结果
        check_results(conn)
        
    except Exception as e:
        logger.error(f"模拟SAM评分时出错: {e}")
    finally:
        conn.close()

def simulate_ratings(conn, video_id, test_name, num_ratings, valence_range, arousal_range):
    """为特定视频模拟多个用户评分"""
    logger.info(f"\n=== 测试场景: {test_name} ===")
    logger.info(f"为视频ID {video_id} 模拟 {num_ratings} 个评分")
    logger.info(f"效价范围: {valence_range}, 唤醒度范围: {arousal_range}")
    
    cursor = conn.cursor()
    
    # 重置视频的评分数据
    cursor.execute(
        "UPDATE videos SET rating_count = 0, is_approved = NULL, sam_valence_avg = NULL, sam_arousal_avg = NULL WHERE id = ?", 
        (video_id,)
    )
    cursor.execute("DELETE FROM user_ratings WHERE video_id = ?", (video_id,))
    conn.commit()
    
    # 模拟多个用户评分
    for i in range(num_ratings):
        valence = random.uniform(valence_range[0], valence_range[1])
        arousal = random.uniform(arousal_range[0], arousal_range[1])
        user_id = f"test_user_{test_name}_{i}"
        
        # 插入用户评分
        cursor.execute(
            "INSERT INTO user_ratings (user_id, video_id, sam_valence, sam_arousal, watch_duration) VALUES (?, ?, ?, ?, ?)",
            (user_id, video_id, valence, arousal, random.randint(60, 180))
        )
        
        # 更新视频评分计数
        cursor.execute(
            "UPDATE videos SET rating_count = COALESCE(rating_count, 0) + 1 WHERE id = ?",
            (video_id,)
        )
        
        # 每添加几个评分就提交一次，模拟真实情况
        if (i + 1) % 4 == 0 or i == num_ratings - 1:
            conn.commit()
            
            # 检查是否达到评分阈值 (16个评分)
            if (i + 1) >= 16:
                process_sam_evaluation(conn, video_id)
                
            # 打印进度
            logger.info(f"已添加 {i + 1}/{num_ratings} 个评分")
            time.sleep(0.5)  # 延迟，避免过快

def process_sam_evaluation(conn, video_id):
    """处理SAM评估逻辑，类似于API中的处理"""
    cursor = conn.cursor()
    
    # 计算平均值和方差
    cursor.execute(
        """SELECT 
            AVG(sam_valence) as avg_valence, 
            AVG(sam_arousal) as avg_arousal, 
            (SUM(sam_valence*sam_valence)/COUNT(*) - (SUM(sam_valence)/COUNT(*))*(SUM(sam_valence)/COUNT(*))) as var_valence, 
            (SUM(sam_arousal*sam_arousal)/COUNT(*) - (SUM(sam_arousal)/COUNT(*))*(SUM(sam_arousal)/COUNT(*))) as var_arousal 
        FROM user_ratings 
        WHERE video_id = ?""",
        (video_id,)
    )
    result = cursor.fetchone()
    
    if result:
        avg_valence = result['avg_valence']
        avg_arousal = result['avg_arousal']
        var_valence = result['var_valence']
        var_arousal = result['var_arousal']
        
        # 检查是否符合批准条件
        is_approved = (
            (abs(avg_valence - 0.5) > 0.2 or abs(avg_arousal - 0.5) > 0.2) and
            var_valence < 0.06 and var_arousal < 0.06
        )
        
        # 更新视频批准状态
        cursor.execute(
            "UPDATE videos SET is_approved = ?, sam_valence_avg = ?, sam_arousal_avg = ? WHERE id = ?",
            (1 if is_approved else 0, avg_valence, avg_arousal, video_id)
        )
        conn.commit()
        
        logger.info(f"SAM评估处理结果:")
        logger.info(f"  平均效价: {avg_valence:.4f} (偏离中性: {abs(avg_valence - 0.5):.4f})")
        logger.info(f"  平均唤醒度: {avg_arousal:.4f} (偏离中性: {abs(avg_arousal - 0.5):.4f})")
        logger.info(f"  效价方差: {var_valence:.4f} {'✓' if var_valence < 0.06 else '✗'}")
        logger.info(f"  唤醒度方差: {var_arousal:.4f} {'✓' if var_arousal < 0.06 else '✗'}")
        logger.info(f"  审核结果: {'通过' if is_approved else '拒绝'}")

def check_results(conn):
    """检查所有测试结果"""
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, title, rating_count, sam_valence_avg, sam_arousal_avg, is_approved 
        FROM videos 
        WHERE rating_count > 0
    """)
    results = cursor.fetchall()
    
    logger.info("\n=== 测试结果总结 ===")
    for video in results:
        logger.info(f"视频: {video['title']} (ID: {video['id']})")
        logger.info(f"  总评分数: {video['rating_count']}")
        logger.info(f"  平均效价: {video['sam_valence_avg']:.4f}")
        logger.info(f"  平均唤醒度: {video['sam_arousal_avg']:.4f}")
        logger.info(f"  审核结果: {'通过' if video['is_approved'] else '拒绝'}")
        logger.info("")

if __name__ == '__main__':
    try:
        simulate_sam_ratings()
        logger.info("SAM评分测试完成！")
    except Exception as e:
        logger.error(f"测试执行出错: {e}")
        sys.exit(1)
