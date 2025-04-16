#!/usr/bin/env python
# -*- coding: utf-8 -*-

from flask import Flask, jsonify
from flask_cors import CORS

# 创建Flask应用
app = Flask(__name__)
CORS(app)  # 启用跨域支持

# 配置应用
app.config.update(
    SECRET_KEY='video-player-app-secret-key',
    JSON_AS_ASCII=False,  # 确保中文正确显示
)

# 导入路由 - 避免循环导入
from api.routes import video_routes, auth_routes

# 注册蓝图 - 确保URL末尾带斜杠与测试一致
app.register_blueprint(video_routes.blueprint, url_prefix='/api/videos/')
app.register_blueprint(auth_routes.blueprint, url_prefix='/api/auth/')

# 错误处理
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': '资源未找到'}), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({'error': '服务器内部错误'}), 500

# 健康检查
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'video-player-api'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
