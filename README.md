# 视频播放器应用

一个集成了用户认证、视频管理和交互式实验功能的全栈视频播放器应用。本应用支持完整的视频播放、评价和实验管理功能，使用真实数据库存储而非仅依赖示例数据。

## 项目结构

```
video-player-app/
├── app/                       # Next.js 应用目录
│   ├── api/                   # API 路由
│   │   ├── auth/              # 认证相关API（登录、注册）
│   │   ├── experiments/       # 实验相关API
│   │   └── videos/            # 视频相关API
│   ├── routes/                # 页面路由
│   │   ├── experiments/       # 实验相关页面
│   │   ├── login/             # 登录页面
│   │   └── register/          # 注册页面
│   ├── video-processing/      # 视频处理页面
│   ├── globals.css            # 全局样式（已整合所有CSS）
│   ├── layout.tsx             # 根布局
│   ├── page.tsx               # 主页
│   └── routes.js              # 路由配置
│
├── components/                # React 组件库
│   ├── experiments/           # 实验相关组件
│   │   ├── ExperimentControl.tsx
│   │   ├── ExperimentManager.tsx
│   │   ├── SAMExperimentStats.tsx
│   │   └── ...
│   ├── forms/                 # 表单相关组件
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   ├── PersonalInfoForm.tsx
│   │   └── ...
│   ├── media/                 # 媒体播放组件
│   │   ├── ExperimentalVideoPlayer.tsx
│   │   ├── SAMScale.tsx
│   │   ├── SAMVideoPlayer.tsx
│   │   └── VideoPlayer.tsx
│   └── ui/                    # UI界面组件
│       ├── 3d/                # 3D相关组件
│       └── ...                # 其他UI组件
│
├── hooks/                     # React 自定义钩子
│   ├── useAuth.ts             # 认证相关钩子
│   └── ...
│
├── lib/                       # 工具库
│   ├── db.ts                  # 数据库工具
│   ├── sqlite_db.ts           # SQLite数据库连接
│   └── utils.ts               # 通用工具函数（已整合所有工具函数）
│
├── public/                    # 静态资源
│   ├── images/                # 图片资源
│   └── ...
│
├── python/                    # Python后端
│   ├── database/              # 数据库模块
│   ├── feature_extraction/    # 特征提取
│   ├── tests/                 # 测试
│   ├── video_scraper/         # 视频爬虫
│   ├── sqlite_db.py           # SQLite数据库操作
│   └── ...
│
├── backend/                   # Java后端
│   ├── src/
│   │   ├── main/java/com/example/videoplayerapp/
│   │   │   ├── controller/    # REST控制器
│   │   │   ├── model/         # 数据模型
│   │   │   ├── service/       # 业务逻辑
│   │   │   └── ...
│   └── ...
│
├── docker/                    # Docker相关配置（已整合）
│   ├── app.Dockerfile         # 应用容器配置
│   ├── audio_feature_extraction.Dockerfile  # 音频特征提取容器
│   ├── video_feature_extraction.Dockerfile  # 视频特征提取容器
│   └── docker-compose.yml     # Docker编排配置
│
├── nginx/                     # Nginx配置
│   └── ...                    # Web服务器配置文件
│
├── types/                     # TypeScript类型定义
│   └── index.ts               # 通用类型定义
│
├── .env                       # 环境变量
├── .env.local                 # 本地环境变量
├── next.config.mjs            # Next.js配置
├── tailwind.config.ts         # Tailwind CSS配置
└── package.json               # 依赖管理
```

## 主要模块说明

### 1. 前端架构

#### 1.1 App目录（Next.js应用）
- **api/**：API路由，采用RESTful风格
  - **auth/**: 处理登录、注册认证流程
  - **videos/**: 管理视频资源，包括获取、评分、上传
  - **experiments/**: 处理实验相关数据提交
- **routes/**：页面路由
  - **experiments/**: 各类实验界面
  - **login/**: 用户登录页面
  - **register/**: 新用户注册页面

#### 1.2 Components组件库
- **experiments/**: 实验相关组件
- **forms/**: 各类表单组件
- **media/**: 媒体播放组件
- **ui/**: 可重用界面组件

#### 1.3 Hooks钩子
- **useAuth.ts**: 认证钩子，管理登录状态和用户信息

#### 1.4 Lib工具库
- **db.ts**: 数据库连接与查询工具
- **utils.ts**: 通用工具函数，如错误处理、日期格式化等

### 2. 后端架构

#### 2.1 Python后端
- **database/**: 数据库操作模块
- **feature_extraction/**: 视频特征提取
- **video_scraper/**: 视频爬取模块

#### 2.2 Java后端
- **controller/**: REST控制器，处理HTTP请求
- **model/**: 数据模型，定义实体结构
- **service/**: 业务逻辑层，实现核心功能
- **repository/**: 数据访问层，与数据库交互

### 3. Docker配置
- **app.Dockerfile**: 主应用Docker配置
- **audio_feature_extraction.Dockerfile**: 音频特征提取容器配置
- **video_feature_extraction.Dockerfile**: 视频特征提取容器配置
- **docker-compose.yml**: Docker编排配置

## API接口

### 视频API

#### 获取推荐视频
- **请求**: `GET /api/videos`
- **响应**: `[{id, title, src, valence, arousal}]`

#### 获取未评分视频
- **请求**: `GET /api/videos/unrated`
- **响应**: `[{id, title, src}]`

#### 提交视频评分
- **请求**: `POST /api/videos/ratings`
- **请求体**: `{videoId, rating, userId}`
- **响应**: `{success: boolean}`

### 实验API

#### 加入实验
- **请求**: `POST /api/experiments/join`
- **请求体**: `{userId, experimentType}`
- **响应**: `{experimentId, videos: [{id, title, src}]}`

#### 提交实验结果
- **请求**: `POST /api/experiments/{experimentId}/submit`
- **请求体**: `{results: [{videoId, valence, arousal}]}`
- **响应**: `{ success: boolean }`

## 实验功能

### 1. SAM实验
自我评估量表(Self-Assessment Manikin)实验，让用户对视频进行情感评分。

### 2. 常规视频实验
标准视频播放实验，记录用户观看行为和反应。

### 3. 任务实验
包含特定任务的复杂实验，测量用户在多种条件下的反应。

## 项目启动（Windows系统）

### 前端开发环境
1. 安装Node.js依赖
   ```bash
   npm install
   ```

2. 启动开发服务器
   ```bash
   npm run dev
   ```

3. 访问 http://localhost:3000

### Java后端启动
1. 进入后端目录
   ```bash
   cd backend
   ```

2. 使用Maven启动
   ```bash
   .\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run
   ```

3. 后端API将在 http://localhost:8080/api 上可用

- 重构了项目结构，提高了代码组织性
- 优化了视频播放器组件，提供了更好的用户体验
- 改进了实验数据收集和分析功能
- 统一了包名结构，确保一致性
- 调整了测试目录结构，与主代码结构保持一致

### Python后端启动
1. 创建并激活Python虚拟环境
   ```bash
   python -m venv .venv
   .\\.venv\\Scripts\\activate
   ```

2. 安装Python依赖
   ```bash
   pip install -r requirements.txt
   ```

3. 初始化数据库（如果是首次运行）
   ```bash
   cd python
   python init_db.py
   ```

4. 启动Python API服务器
   ```bash
   python test_api_server.py
   ```

### 本地环境整合启动
使用PowerShell脚本一键启动整个环境:
   ```bash
   .\启动本地测试环境.ps1
   ```

## 系统架构

### 技术栈

- **前端**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **后端**: Java Spring Boot 3, Python API
- **数据库**: PostgreSQL 13+, MongoDB 4.4+, Redis 6+
- **爬虫框架**: Scrapy 2.8+
- **情绪评估**: SAM量表评分系统
- **容器化**: Docker, Docker Compose
- **测试**: Vitest, JUnit, pytest

### 系统组件

本系统已经经过全面重构，包含以下关键组件，所有组件均可在服务器环境中稳定运行：

1. **前端应用** (Next.js):
   - 统一了技术栈，移除了Vue.js组件
   - 采用功能分类组织组件：experiments/, forms/, media/, ui/
   - 合并了重复的工具函数库

2. **视频播放器系统**:
   - SAM量表视频评价播放器
   - 实验范式视频播放器
   - 基于情绪参数的视频分类自动化

3. **后端系统**:
   - Java Spring Boot API
   - Python Flask 服务
   - 视频爬虫系统

4. **数据存储架构**:
   - PostgreSQL: 主要应用数据
   - MongoDB: 爬虫采集的原始视频数据
   - Redis: 缓存和会话管理

### 服务器兴容性

本系统已通过全面重构，确保可在服务器环境中稳定运行：

- **已测试操作系统**: Ubuntu 20.04/22.04, CentOS 8+, Debian 11+
- **系统要求**: 
  - CPU: 至少2核心 (4核心或以上推荐)
  - 内存: 至少4GB (运行全部服务建议8GB或以上)
  - 磁盘空间: 至少20GB (视频存储根据需求可能需要更多)

所有服务已通过Docker容器化，可以在任何支持Docker的环境中运行。

### 架构优化

最新版本进行了以下架构优化:

- 统一了前端技术栈，完全基于Next.js框架
- 优化了组件结构，按功能分类组织
- 合并了重复的工具函数，提高代码复用
- 规范了API接口设计，遵循RESTful原则
- 移动Python文件到python/目录，提高目录结构清晰度
- 增强了视频播放器功能，支持更多交互方式
- 增添了SAM量表评分系统和视频自动爬虫
- 完善了实验数据收集和分析功能
- 加强了安全性，实现了完整的JWT认证
- 优化了Docker配置，便于容器化部署
- 改进了测试架构，提高测试覆盖率
- 添加完整的测试环境配置和示例
- 修复VideoPlayer组件测试和JwtTokenUtil测试问题
- 添加简化测试配置用于隔离测试特定组件
- 创建测试总结文档，详细说明当前测试环境状态与解决方案
- 集成Vitest测试框架替代Jest，提高测试稳定性
- 添加Docker容器化测试环境和CI/CD集成

## 项目测试

项目已配置完整的测试环境，支持前端、Python后端和Java后端的自动化测试。现在我们提供多种测试方式供选择。

### 测试环境概览

- **前端测试**：使用Vitest和React Testing Library（同时保留Jest作为备选）
- **Python后端测试**：使用pytest框架
- **Java后端测试**：使用JUnit和Mockito框架
- **Docker容器化测试**：提供隔离的测试环境
- **CI/CD集成**：通过GitHub Actions自动运行测试

### 运行测试

#### Docker容器化测试（推荐）

使用Docker运行所有测试，避免环境依赖问题：

```bash
.\run_all_docker_tests.ps1
```

这将在Docker容器中依次运行前端和后端测试，提供隔离的测试环境，确保测试结果的一致性。

#### 本地测试

##### Vitest前端测试（新版）

```bash
# 运行所有前端测试
npm test

# 以监视模式运行前端测试
npm run test:watch

# 生成测试覆盖率报告
npm run test:coverage

# 仅运行组件测试
npm run test:component

# 使用Vitest UI界面运行测试
npm run test:ui
```

##### Jest前端测试（备选）

```bash
# 使用Jest运行测试（如果Vitest不适用）
npm run test:jest-legacy
```

##### 后端测试

```bash
# Python后端测试
cd python
python -m pytest

# Java后端测试
cd backend
.\apache-maven-3.9.6\bin\mvn.cmd test
```

#### CI/CD自动测试

项目已配置GitHub Actions工作流，自动在以下情况触发测试：

- 推送到main、master或develop分支
- 向这些分支创建Pull Request

测试结果和覆盖率报告将自动提交到GitHub Actions，可在Actions选项卡中查看。

### 测试文件位置

- **前端测试**：位于`__tests__`目录，按功能分类
- **Python测试**：位于`python/tests`目录
- **Java测试**：位于`backend/src/test`目录
- **Docker测试配置**：位于`docker/test.Dockerfile`和`docker/docker-compose.test.yml`
- **CI/CD配置**：位于`.github/workflows/test.yml`

### 测试技术栈

| 组件 | 主要技术 | 备选技术 |
|------|---------|---------|
| 前端 | Vitest + React Testing Library | Jest + React Testing Library |
| Python后端 | pytest | unittest |
| Java后端 | JUnit + Mockito | - |
| 容器化 | Docker | - |
| CI/CD | GitHub Actions | - |

### 测试环境故障排除

#### 前端测试问题

- **Jest环境问题**：确保安装了`jest-environment-jsdom`
  ```bash
  npm install --save-dev jest-environment-jsdom --legacy-peer-deps
  ```

- **TypeScript错误**：检查`jest.config.js`和`jest.setup.js`配置

#### Python测试问题

- **模块导入错误**：确保正确设置了Python路径
  ```python
  import sys, os
  sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
  ```

- **依赖缺失**：安装所有必要的Python包
  ```bash
  pip install -r python/requirements.txt
  ```

#### Java测试问题

- **构造函数不匹配**：确保测试中使用的构造函数与模型类匹配
- **依赖注入问题**：检查是否正确模拟了所有必要的服务

### 添加新测试

#### 前端组件测试

在`__tests__/components`目录中添加以`.test.tsx`结尾的文件：

```tsx
import { render, screen } from '@testing-library/react';
import YourComponent from '@/components/path/YourComponent';

describe('YourComponent', () => {
  it('应该正确渲染', () => {
    render(<YourComponent />);
    // 添加断言
  });
});
```

#### Python API测试

在`python/tests`目录中添加以`test_`开头的Python文件：

```python
import pytest

def test_your_function():
    # 添加测试逻辑和断言
    assert True
```

#### Java服务测试

在`backend/src/test`对应的包中添加测试类：

```java
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class YourServiceTest {
    @Test
    public void testYourFunction() {
        // 添加测试逻辑和断言
    }
}
```

## 部署指南

本项目支持完整的生产环境部署，确保所有功能使用真实数据库而非示例数据。包括视频浏览、SAM量表评价、实验范式播放器和自动爬虫视频采集等完整功能。以下是详细的部署步骤：

### 准备工作

1. 确保服务器已安装：
   - Docker 和 Docker Compose (生产部署必需)
   - PostgreSQL 13+ (存储用户和视频元数据)
   - Redis 6+ (缓存和会话管理)
   - MongoDB 4.4+ (爬虫采集的原始视频数据存储)
   - 足够的磁盘空间（建议最少20GB，视频存储需要大量空间）
   - 快速的网络连接（特别是如果要爬取高清视频）
   - Node.js 18+（仅用于本地开发）

2. 克隆代码库：
   ```bash
   git clone https://github.com/your-username/video-player-app.git
   cd video-player-app
   ```

### 数据库配置

1. 在生产环境中，使用以下命令创建并初始化PostgreSQL数据库：
   ```bash
   # 创建数据库
   sudo -u postgres createdb video_player_db
   
   # 导入表结构（可选，应用也会自动创建表结构）
   # sudo -u postgres psql -d video_player_db -f database/schema.sql
   ```

2. 请注意，项目已配置为：
   - 禁用模拟服务模式 (`app.mock-service.enabled=false`)
   - 要求数据库连接 (`spring.datasource.continue-on-error=false`)

### 部署应用

#### 使用Docker部署（推荐）

1. 配置环境变量（强烈建议）：
   创建或编辑 `.env` 文件设置以下变量：
   ```
   # 数据库配置
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=your_secure_password
   
   # MongoDB配置
   MONGO_USER=admin
   MONGO_PASSWORD=your_secure_mongo_password
   
   # 视频设置
   VIDEO_STORAGE_PATH=/data/videos    # 视频文件存储路径
   
   # SAM评分系统设置
   MAX_UNRATED_VIDEOS=40              # 未评分视频数量上限
   MIN_RATINGS_PER_VIDEO=16           # 每个视频所需的评分数
   ```

2. 使用Docker Compose启动应用：
   ```bash
   # 生产环境部署
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. 验证应用状态：
   ```bash
   docker-compose -f docker-compose.prod.yml ps
   curl http://localhost:8080/api/health-check
   ```

#### 不使用Docker的手动部署

1. 后端部署：
   ```bash
   # 进入backend目录
   cd backend
   
   # 使用Maven构建
   ./mvnw clean package -DskipTests
   
   # 运行JAR文件
   java -jar target/video-player-app-0.0.1-SNAPSHOT.jar
   ```

2. 前端部署：
   ```bash
   # 安装依赖
   npm install
   
   # 构建前端
   npm run build
   
   # 启动前端服务
   npm start
   ```

### 生产环境访问

- 后端API: http://your-server-ip:8080/api
- 前端应用: http://your-server-ip:3000
- MongoDB数据库: mongodb://your-server-ip:27017

### 注意事项

1. **数据库连接**：确保数据库已正确配置且可访问。系统现在已禁用所有模拟数据，必须使用真实数据库连接。
   - PostgreSQL：用于用户账户、视频元数据和合格视频存储
   - MongoDB：用于爬虫采集的原始视频数据存储

2. **环境变量**：生产环境下请为以下关键变量设置安全值：
   - `POSTGRES_PASSWORD`：数据库密码
   - `JWT_SECRET`：用于身份验证的密钥
   - `MONGO_PASSWORD`：MongoDB密码（用于爬虫数据存储）
   - `SPRING_PROFILES_ACTIVE`：设置为`prod`确保生产环境配置
   - `APP_MOCK_SERVICE_ENABLED`：设置为`false`确保使用真实数据库

3. **初始数据**：首次部署时可能需要创建管理员账户：
   ```sql
   INSERT INTO users (username, email, password, full_name, is_admin, is_active) 
   VALUES ('admin', 'admin@example.com', '$2a$10$X7VYCcwTwLzWGP.vC4qwnOeUFVUn8/fmpyD5jBUDTgNJULOqNZZm2', '管理员', true, true);
   ```
   (密码为`admin123`，建议部署后立即修改)

4. **视频存储**：确保视频文件存储路径正确配置且有足够空间：
   - `VIDEO_STORAGE_PATH`：视频文件存储路径（建议最少10GB空间）
   - 确保存储路径可读写且有足够权限

5. **SAM评分系统**：系统现在使用两个独立表分别存储：
   - `videos`表：仅存储未评分视频（最外40个）
   - `approved_videos`表：存储所有通过SAM评分筛选的合格视频（用于实验范式播放器）
   - 每个视频需要至16人评分后才会进行评估
   
   - 对于方差小于0.06且平均值明显偏离中性的视频才会被保留

### 爬虫服务部署

项目包含一个基于Scrapy的视频爬虫服务，用于自动采集视频数据。以下是部署和运行爬虫的步骤：

#### 1. 自动部署（使用Docker）

在使用`docker-compose.prod.yml`启动服务时，爬虫服务会自动部署。它将作为一个单独的服务运行，并将数据存储在MongoDB中。

```bash
# 启动所有服务，包括爬虫
$ docker-compose -f docker-compose.prod.yml up -d
```

#### 2. 手动运行爬虫（服务器上）

如果需要手动运行爬虫，可以执行以下命令：

```bash
# 进入爬虫容器
$ docker exec -it video-player-app_spider_1 /bin/bash

# 在容器内运行爬虫
$ python run_spider.py --mongo-uri mongodb://mongodb:27017 --mongo-db video_db
```

#### 3. 定时运行爬虫

在服务器上设置定时任务，定期运行爬虫：

```bash
# 执行以下命令添加crontab任务（每天6点运行）
$ crontab -e

# 添加以下行
0 6 * * * docker exec video-player-app_spider_1 python run_spider.py --mongo-uri mongodb://mongodb:27017 --mongo-db video_db >> /var/log/video_spider.log 2>&1
```

#### 4. 爬虫数据同步到PostgreSQL

爬虫采集的数据默认存储在MongoDB中，通过以下命令可以同步数据到PostgreSQL数据库：

```bash
# 进入爬虫容器
$ docker exec -it video-player-app_spider_1 /bin/bash

# 运行数据同步脚本
$ python sync_to_postgres.py
```

#### 5. 爬虫日志和监控

爬虫日志位于容器内的`/app/video_spider.log`，可以通过以下命令查看：

```bash
$ docker exec video-player-app_spider_1 cat /app/video_spider.log
```

如果需要实时监控爬虫运行状态：

```bash
$ docker exec video-player-app_spider_1 tail -f /app/video_spider.log
```
