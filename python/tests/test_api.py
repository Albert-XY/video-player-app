import pytest
import requests
from unittest.mock import patch, MagicMock
import sys
import os

# 添加项目根目录到系统路径
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# 导入API模块
from api.app import app
from api.routes import video_routes

@pytest.fixture
def client():
    """创建测试客户端"""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

@pytest.mark.api
def test_get_videos_endpoint(client):
    """测试获取视频列表API"""
    # 模拟数据库返回结果
    mock_videos = [
        {"id": 1, "title": "测试视频1", "url": "https://example.com/video1.mp4"},
        {"id": 2, "title": "测试视频2", "url": "https://example.com/video2.mp4"}
    ]
    
    # 使用补丁模拟数据库查询
    with patch('api.routes.video_routes.get_all_videos', return_value=mock_videos):
        # 修改请求路径，确保路径末尾有斜杠
        response = client.get('/api/videos/')
        
        # 验证响应
        assert response.status_code == 200
        data = response.get_json()
        assert len(data) == 2
        assert data[0]['title'] == "测试视频1"
        assert data[1]['title'] == "测试视频2"

@pytest.mark.api
def test_get_video_by_id_endpoint(client):
    """测试通过ID获取视频API"""
    # 模拟数据库返回结果
    mock_video = {"id": 1, "title": "测试视频1", "url": "https://example.com/video1.mp4"}
    
    # 使用补丁模拟数据库查询
    with patch('api.routes.video_routes.get_video_by_id', return_value=mock_video):
        response = client.get('/api/videos/1/')
        
        # 验证响应
        assert response.status_code == 200
        data = response.get_json()
        assert data['id'] == 1
        assert data['title'] == "测试视频1"
        assert data['url'] == "https://example.com/video1.mp4"

@pytest.mark.api
def test_video_not_found(client):
    """测试视频未找到的情况"""
    # 使用补丁模拟数据库查询返回None
    with patch('api.routes.video_routes.get_video_by_id', return_value=None):
        response = client.get('/api/videos/999/')
        
        # 验证响应
        assert response.status_code == 404
        data = response.get_json()
        assert 'error' in data
        assert '未找到' in data['error']

@pytest.mark.api
def test_create_video(client):
    """测试创建视频API"""
    # 准备测试数据
    new_video = {
        "title": "新测试视频",
        "url": "https://example.com/new_video.mp4",
        "description": "这是一个测试描述"
    }
    
    # 模拟添加视频后的返回结果
    mock_result = {**new_video, "id": 3}
    
    # 使用补丁模拟数据库插入
    with patch('api.routes.video_routes.add_video', return_value=mock_result):
        response = client.post('/api/videos/', json=new_video)
        
        # 验证响应
        assert response.status_code == 201
        data = response.get_json()
        assert data['id'] == 3
        assert data['title'] == "新测试视频"
        assert data['url'] == "https://example.com/new_video.mp4"
