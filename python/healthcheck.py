#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys
import json
import time
import logging
import requests
import psycopg2

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("healthcheck.log")
    ]
)

logger = logging.getLogger("healthcheck")

def check_database():
    """检查数据库连接状态"""
    try:
        # 从环境变量获取数据库配置
        db_host = os.environ.get("DB_HOST", "db")
        db_port = os.environ.get("DB_PORT", "5432")
        db_user = os.environ.get("POSTGRES_USER", "postgres")
        db_password = os.environ.get("POSTGRES_PASSWORD", "postgres")
        db_name = os.environ.get("POSTGRES_DB", "video_player")
        
        # 尝试连接数据库
        conn = psycopg2.connect(
            host=db_host,
            port=db_port,
            user=db_user,
            password=db_password,
            dbname=db_name
        )
        
        # 执行简单查询
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        result = cursor.fetchone()
        
        # 关闭连接
        cursor.close()
        conn.close()
        
        if result and result[0] == 1:
            logger.info("Database health check: PASS")
            return True
        else:
            logger.error("Database health check: FAIL (unexpected query result)")
            return False
    except Exception as e:
        logger.error(f"Database health check: FAIL - {e}")
        return False

def check_api_service():
    """检查API服务状态"""
    try:
        # 假设API服务在8080端口
        api_url = os.environ.get("API_URL", "http://backend:8080/api/health")
        response = requests.get(api_url, timeout=5)
        
        if response.status_code == 200:
            logger.info("API service health check: PASS")
            return True
        else:
            logger.error(f"API service health check: FAIL (status code: {response.status_code})")
            return False
    except Exception as e:
        logger.error(f"API service health check: FAIL - {e}")
        return False

def check_frontend_service():
    """检查前端服务状态"""
    try:
        # 假设前端服务在3000端口
        frontend_url = os.environ.get("FRONTEND_URL", "http://frontend:3000/api/health")
        response = requests.get(frontend_url, timeout=5)
        
        if response.status_code == 200:
            logger.info("Frontend service health check: PASS")
            return True
        else:
            logger.error(f"Frontend service health check: FAIL (status code: {response.status_code})")
            return False
    except Exception as e:
        logger.error(f"Frontend service health check: FAIL - {e}")
        return False

def check_nginx_service():
    """检查Nginx服务状态"""
    try:
        # 假设Nginx在80端口
        nginx_url = os.environ.get("NGINX_URL", "http://nginx:80/api/health")
        response = requests.get(nginx_url, timeout=5)
        
        if response.status_code == 200:
            logger.info("Nginx service health check: PASS")
            return True
        else:
            logger.error(f"Nginx service health check: FAIL (status code: {response.status_code})")
            return False
    except Exception as e:
        logger.error(f"Nginx service health check: FAIL - {e}")
        return False

def main():
    """执行所有健康检查并返回结果"""
    results = {
        "database": check_database(),
        "api": check_api_service(),
        "frontend": check_frontend_service(),
        "nginx": check_nginx_service(),
        "timestamp": time.time()
    }
    
    all_passed = all(results.values())
    status = "healthy" if all_passed else "unhealthy"
    
    results["status"] = status
    
    logger.info(f"Overall health status: {status}")
    print(json.dumps(results, indent=2))
    
    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(main())
