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

def test_api_health():
    """测试API健康状态"""
    try:
        response = requests.get(f"{API_BASE_URL}/api/health")
        if response.status_code == 200:
            logger.info("API健康检查通过")
            return True
        else:
            logger.error(f"API健康检查失败: 状态码 {response.status_code}")
            return False
    except Exception as e:
        logger.error(f"API健康检查异常: {e}")
        return False

def get_videos():
    """获取视频列表"""
    try:
        response = requests.get(f"{API_BASE_URL}/api/videos")
        if response.status_code == 200:
            videos = response.json()
            logger.info(f"获取到 {len(videos)} 个视频")
            return videos
        else:
            logger.error(f"获取视频列表失败: 状态码 {response.status_code}")
            return []
    except Exception as e:
        logger.error(f"获取视频列表异常: {e}")
        return []

def submit_sam_rating(video_id, user_id, valence, arousal):
    """提交SAM评分"""
    try:
        data = {
            "videoId": video_id,
            "userId": user_id,
            "valence": valence,
            "arousal": arousal,
            "watchDuration": random.randint(60, 180)
        }
        logger.info(f"提交SAM评分: {data}")
        
        response = requests.post(
            f"{API_BASE_URL}/api/sam-ratings", 
            json=data
        )
        
        result = response.json()
        if response.status_code == 200:
            logger.info(f"SAM评分提交成功: {result}")
            return True
        else:
            logger.error(f"SAM评分提交失败: {result}")
            return False
    except Exception as e:
        logger.error(f"SAM评分提交异常: {e}")
        return False

def get_video_stats():
    """获取视频统计信息"""
    try:
        response = requests.get(f"{API_BASE_URL}/api/video-stats")
        if response.status_code == 200:
            stats = response.json()
            logger.info(f"获取到 {len(stats)} 个视频统计信息")
            
            for stat in stats:
                logger.info(f"视频ID: {stat['id']}, 标题: {stat.get('title', '无标题')}, " +
                           f"评分数: {stat.get('total_ratings', 0)}, " + 
                           f"审核状态: {stat.get('approval_status', '未知')}")
            
            return stats
        else:
            logger.error(f"获取视频统计信息失败: 状态码 {response.status_code}")
            return []
    except Exception as e:
        logger.error(f"获取视频统计信息异常: {e}")
        return []

def test_sam_ratings():
    """测试SAM评分功能"""
    # 检查API健康状态
    if not test_api_health():
        logger.error("API服务器不可用，测试终止")
        return
    
    # 获取视频列表
    videos = get_videos()
    if not videos:
        logger.error("无法获取视频列表，测试终止")
        return
    
    # 选择第一个视频进行测试
    test_video = videos[0]
    video_id = test_video['id']
    
    logger.info(f"选择视频 '{test_video.get('title', '无标题')}' (ID: {video_id}) 进行测试")
    
    # 模拟一个用户提交评分
    user_id = f"test_user_{int(time.time())}"
    
    # 模拟高效价、低唤醒评分
    submit_sam_rating(video_id, user_id, 0.8, 0.2)
    
    # 获取视频统计
    get_video_stats()

if __name__ == "__main__":
    try:
        test_sam_ratings()
        logger.info("SAM评分API测试完成！")
    except KeyboardInterrupt:
        logger.info("测试被用户中断")
    except Exception as e:
        logger.error(f"测试执行出错: {e}")
        import traceback
        logger.error(traceback.format_exc())
        sys.exit(1)
