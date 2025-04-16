# 视频播放器应用

一个集成了用户认证、视频管理和交互式实验功能的全栈视频播放器应用。

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
  - **experiments/**: 包含SAM评估、常规实验和任务实验页面
  - **login/**: 用户登录页面
  - **register/**: 用户注册页面

#### 1.2 Components（React组件）
- **experiments/**: 实验相关组件，包括实验控制、管理、数据统计等
- **forms/**: 表单相关组件，包括登录、注册、问卷等
- **media/**: 媒体播放组件，包括视频播放器和SAM评估界面
- **ui/**: 通用UI组件，包括按钮、输入框、模态框等

#### 1.3 工具库
- **hooks/**: React自定义钩子，如useAuth处理认证状态
- **lib/**: 通用工具函数库，包含数据处理、API调用等功能
- **types/**: TypeScript类型定义

### 2. 后端架构

#### 2.1 Python后端
- **database/**: 数据库模块，处理SQLite操作
- **feature_extraction/**: 视频和音频特征提取
- **video_scraper/**: 视频内容爬取工具
- **test_api_server.py**: 测试API服务器
- **sqlite_db.py**: SQLite数据库管理

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

### 1. 认证相关

#### 1.1 登录
- **路径**: `/api/auth/login`
- **方法**: POST
- **请求体**: `{ username: string, password: string }`
- **响应**: `{ success: boolean, userId: number, username: string }`

#### 1.2 注册
- **路径**: `/api/auth/register`
- **方法**: POST
- **请求体**: `{ username: string, password: string, email: string, fullName: string }`
- **响应**: `{ success: boolean, message: string }`

### 2. 视频相关

#### 2.1 获取未评分视频
- **路径**: `/api/videos/unrated`
- **方法**: GET
- **查询参数**: `userId`
- **响应**: `Array<{ id: string, title: string, src: string }>`

#### 2.2 获取已批准视频
- **路径**: `/api/videos/approved`
- **方法**: GET
- **响应**: `Array<{ id: string, title: string, src: string, valence: number, arousal: number }>`

#### 2.3 提交视频评分
- **路径**: `/api/experiments/sam`
- **方法**: POST
- **请求体**: `{ userId: number, videoId: string, valence: number, arousal: number }`
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
   # 或者使用pnpm
   pnpm install
   ```

2. 启动Next.js前端服务
   ```bash
   npm run dev
   # 或者使用pnpm
   pnpm dev
   ```
   前端服务将在 http://localhost:3000 启动

### Python后端启动
1. 创建并激活Python虚拟环境
   ```bash
   python -m venv .venv
   .\.venv\Scripts\activate
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
   Python后端将在 http://localhost:5000 启动

### Java后端启动（可选）
1. 确保安装了JDK 17或更高版本和Maven

2. 编译并启动Spring Boot应用
   ```bash
   cd backend
   .\mvnw.cmd spring-boot:run
   ```
   Java后端将在 http://localhost:8080 启动

### 使用Docker启动完整环境（可选）
如果您安装了Docker和Docker Compose，可以一键启动完整环境：

```bash
cd docker
docker-compose up
```

这将启动前端、后端和数据库服务，并通过Nginx整合所有服务。

## 本地环境要求

- **Node.js**: 18.x或更高版本
- **Python**: 3.8或更高版本
- **JDK**: 17或更高版本（仅Java后端需要）
- **Docker**: 最新版本（可选，用于容器化部署）

## 最近更新

- 项目结构优化，移除冗余文件和目录
- 统一所有样式到app/globals.css
- 整合所有Docker配置到docker目录
- 清理大型二进制文件，减小项目体积
- 更新文档和运行说明
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
