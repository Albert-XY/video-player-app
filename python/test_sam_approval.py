import requests
import json
import logging
import sys
import time
import random

# 配置日志输出
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# API地址
API_BASE_URL = "http://localhost:8080"

def test_video_approval(video_id, num_ratings=16):
    """测试视频SAM评分审核流程 - 对单个视频提交多次评分，达到阈值后看是否被批准"""
    
    # 获取视频详情
    response = requests.get(f"{API_BASE_URL}/api/videos")
    videos = response.json()
    target_video = None
    
    for video in videos:
        if video['id'] == video_id:
            target_video = video
            break
    
    if not target_video:
        logger.error(f"未找到ID为 {video_id} 的视频")
        return
    
    logger.info(f"开始对视频'{target_video.get('title')}' (ID: {video_id})进行{num_ratings}次SAM评分测试")
    
    # 提交多次评分 - 使用固定的SAM评分以确保通过审核
    for i in range(num_ratings):
        user_id = f"test_user_{int(time.time())}_{i}"
        
        # 使用高效价、低唤醒的SAM评分 - 确保情感显著且一致
        valence = 0.8 + random.uniform(-0.05, 0.05)  # 在0.75-0.85之间
        arousal = 0.2 + random.uniform(-0.05, 0.05)  # 在0.15-0.25之间
        
        data = {
            "videoId": video_id,
            "userId": user_id,
            "valence": valence,
            "arousal": arousal,
            "watchDuration": random.randint(90, 180)
        }
        
        try:
            logger.info(f"提交第 {i+1}/{num_ratings} 个评分: 效价={valence:.2f}, 唤醒度={arousal:.2f}")
            response = requests.post(f"{API_BASE_URL}/api/sam-ratings", json=data)
            
            if response.status_code == 200:
                logger.info("评分提交成功!")
            else:
                logger.error(f"评分提交失败: {response.json()}")
                return
                
            # 小暂停，避免请求过快
            time.sleep(0.1)
        except Exception as e:
            logger.error(f"提交评分时出错: {e}")
            return
    
    # 查看视频的当前状态
    logger.info(f"已完成 {num_ratings} 次评分，检查视频状态...")
    response = requests.get(f"{API_BASE_URL}/api/video-stats")
    stats = response.json()
    
    target_stats = None
    for stat in stats:
        if stat['id'] == video_id:
            target_stats = stat
            break
    
    if target_stats:
        logger.info(f"视频ID {video_id} 的状态:")
        logger.info(f"  标题: {target_stats.get('title')}")
        logger.info(f"  评分数: {target_stats.get('total_ratings')}")
        logger.info(f"  审核状态: {target_stats.get('approval_status')}")
        
        if target_stats.get('approval_status') == 'approved':
            logger.info("视频通过了SAM情感评估!")
        elif target_stats.get('approval_status') == 'rejected':
            logger.info("视频未通过SAM情感评估!")
        else:
            logger.warning("视频仍在评估中，评分可能未达到阈值或已有评分分歧过大")
    else:
        logger.error(f"未能获取视频ID {video_id} 的状态")

def test_with_negative_emotion(video_id, num_ratings=16):
    """使用低效价高唤醒度的情绪模式测试视频"""
    logger.info(f"开始对视频ID {video_id} 进行{num_ratings}次消极情绪SAM评分测试")
    
    # 获取视频详情
    response = requests.get(f"{API_BASE_URL}/api/videos")
    videos = response.json()
    target_video = None
    
    for video in videos:
        if video['id'] == video_id:
            target_video = video
            break
    
    if not target_video:
        logger.error(f"未找到ID为 {video_id} 的视频")
        return
        
    logger.info(f"目标视频: '{target_video.get('title')}' (ID: {video_id})")
    
    # 提交多次评分 - 使用低效价、高唤醒的SAM评分 (消极情绪)
    for i in range(num_ratings):
        user_id = f"test_user_neg_{int(time.time())}_{i}"
        
        valence = 0.2 + random.uniform(-0.05, 0.05)  # 在0.15-0.25之间 (低效价)
        arousal = 0.8 + random.uniform(-0.05, 0.05)  # 在0.75-0.85之间 (高唤醒)
        
        data = {
            "videoId": video_id,
            "userId": user_id,
            "valence": valence,
            "arousal": arousal,
            "watchDuration": random.randint(90, 180)
        }
        
        try:
            logger.info(f"提交第 {i+1}/{num_ratings} 个评分: 效价={valence:.2f}, 唤醒度={arousal:.2f}")
            response = requests.post(f"{API_BASE_URL}/api/sam-ratings", json=data)
            
            if response.status_code == 200:
                logger.info("评分提交成功!")
            else:
                logger.error(f"评分提交失败: {response.json()}")
                return
                
            # 小暂停，避免请求过快
            time.sleep(0.1)
        except Exception as e:
            logger.error(f"提交评分时出错: {e}")
            return
    
    # 查看视频的当前状态
    logger.info(f"已完成 {num_ratings} 次消极情绪评分，检查视频状态...")
    response = requests.get(f"{API_BASE_URL}/api/video-stats")
    stats = response.json()
    
    target_stats = None
    for stat in stats:
        if stat['id'] == video_id:
            target_stats = stat
            break
    
    if target_stats:
        logger.info(f"视频ID {video_id} 的状态:")
        logger.info(f"  标题: {target_stats.get('title')}")
        logger.info(f"  评分数: {target_stats.get('total_ratings')}")
        logger.info(f"  审核状态: {target_stats.get('approval_status')}")
        
        if target_stats.get('approval_status') == 'approved':
            logger.info("视频通过了SAM情感评估!")
        elif target_stats.get('approval_status') == 'rejected':
            logger.info("视频未通过SAM情感评估!")
        else:
            logger.warning("视频仍在评估中，评分可能未达到阈值或已有评分分歧过大")
    else:
        logger.error(f"未能获取视频ID {video_id} 的状态")

if __name__ == "__main__":
    try:
        # 测试视频ID 3 - 用低效价、高唤醒度 (消极情绪)
        video_id = 3
        
        # 运行消极情绪测试
        test_with_negative_emotion(video_id, 16)
        
        logger.info("SAM评分审核测试完成")
    except KeyboardInterrupt:
        logger.info("测试被用户中断")
    except Exception as e:
        logger.error(f"测试执行出错: {e}")
        import traceback
        logger.error(traceback.format_exc())
