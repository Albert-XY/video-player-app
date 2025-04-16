import os
import sys
import pytest

# 添加项目根目录到路径
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# 基本测试确认测试环境正常
def test_environment():
    """确认测试环境可以正常工作"""
    assert True

def test_api_import():
    """确认API模块可以导入"""
    try:
        from api.app import app
        assert app is not None
    except ImportError as e:
        pytest.fail(f"无法导入API模块: {e}")
