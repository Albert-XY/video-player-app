# Video Player App

This is a Next.js application that allows users to register, login, and watch videos. The app uses PostgreSQL for data storage and includes features like random video selection, SAM scale rating, and tracking of video start and end times.

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up your PostgreSQL database and update the `.env.local` and `.env.production` files with your database URL
4. Run the development server: `npm run dev`

## Deployment

This project is set up for deployment using Docker and GitHub Actions.

### Prerequisites

- Docker and Docker Compose installed on your server
- A DockerHub account
- A server with SSH access

### Setup

1. Fork this repository to your GitHub account.

2. In your GitHub repository settings, add the following secrets:
   - `DOCKERHUB_USERNAME`: Your DockerHub username
   - `DOCKERHUB_TOKEN`: Your DockerHub access token
   - `SERVER_HOST`: Your server's IP address or domain name
   - `SERVER_USERNAME`: The username to SSH into your server
   - `SERVER_SSH_KEY`: The private SSH key to access your server

3. On your server, create a directory for the project and copy the `docker-compose.yml` file into it.

4. Create a `.env` file in the same directory with the following variables:

## 部署步骤

### 1. 配置 GitHub Actions

- **GitHub Secrets**: 在 GitHub 仓库中设置以下 Secrets，以便在工作流中使用：
  - `DOCKERHUB_USERNAME`: DockerHub 用户名
  - `DOCKERHUB_TOKEN`: DockerHub 访问令牌
  - `SERVER_HOST`: 服务器的 IP 地址或域名
  - `SERVER_USERNAME`: 服务器的 SSH 用户名
  - `SERVER_SSH_KEY`: 服务器的 SSH 私钥
：此处原作者以创建，若之后服务器变更或其他原因需要更改，请在github仓库中secrets进行修改
- **工作流文件**: 确保 `.github/workflows/deploy.yml` 文件正确配置，包含以下关键步骤：
  - 检出代码到工作目录。
  - 登录到 DockerHub。
  - 通过 SSH 连接到生产服务器并执行部署操作。
已完成
### 2. 配置服务器

- **环境变量**: 在服务器上创建 `.env` 文件，配置所需的环境变量。
  ```bash
  touch .env
  echo "ENV_VAR_NAME=value" >> .env
  ```

- **Docker 和 Docker Compose**: 确保服务器上已安装 Docker 和 Docker Compose。
  ```bash
  # 安装 Docker
  sudo yum update -y
  sudo yum install -y docker
  sudo systemctl start docker
  sudo systemctl enable docker

  # 安装 Docker Compose
  sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
  ```
已安装
- **防火墙配置**: 根据需要开放相关端口（如 8080），以便应用程序可以正常运行。
  ```bash
  sudo firewall-cmd --permanent --add-port=8080/tcp
  sudo firewall-cmd --reload
  ```
已配置
### 3. 配置 Docker

- **Dockerfile 和 docker-compose.yml**: 确保项目根目录下的 `Dockerfile` 和 `docker-compose.yml` 文件配置正确，用于构建和运行 Docker 容器。

- **镜像构建和推送**: 使用 Docker Compose 构建镜像，并推送到 DockerHub。
  ```bash
  docker-compose build
  docker-compose push
  ```

### 4. 部署应用

- **拉取最新镜像**: 在服务器上使用 Docker Compose 拉取最新的应用镜像。
  ```bash
  docker-compose pull
  ```

- **启动容器**: 使用 Docker Compose 启动容器，确保应用在后台运行。
  ```bash
  docker-compose up -d
  ```

### 5. 验证部署

- **检查日志**: 查看应用程序和服务器日志，确保没有错误。
  ```bash
  docker-compose logs
  ```

- **访问应用**: 在浏览器中访问应用程序的 URL，验证其是否正常运行。

通过这些步骤，您可以成功地使用 GitHub Actions 部署您的 `video-player-app` 项目到服务器上。

## 部署指南

### 1. 项目部署架构

该项目采用基于Docker的多容器架构部署，主要组件包括：

- **前端服务 (Frontend)**: Next.js应用，运行在容器中，负责用户界面展示
- **后端服务 (Backend)**: Flask API，处理业务逻辑和数据处理
- **数据库 (Database)**: PostgreSQL数据库，存储视频数据和用户评分
- **反向代理 (Nginx)**: 处理HTTP请求路由，将请求分发到前端和后端服务

### 2. 部署准备

#### 2.1 服务器要求

- 操作系统：Linux (推荐Ubuntu 20.04或CentOS 7)
- 安装Docker (20.10+)和Docker Compose (2.0+)
- 开放端口：80 (HTTP), 443 (HTTPS), 22 (SSH)
- 至少2GB内存和10GB可用磁盘空间

#### 2.2 环境变量配置

在服务器项目目录创建`.env`文件，参照`.env.example`文件设置以下变量：

```
# 数据库配置
POSTGRES_DB=video_player
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password

# 安全配置
SECRET_KEY=your_secure_secret_key
```

### 3. 部署流程

#### 3.1 使用GitHub Actions自动部署

已配置GitHub Actions工作流进行自动化部署，当代码推送到master分支时触发。

需要在GitHub仓库设置以下Secrets：
- **DOCKERHUB_USERNAME**: DockerHub用户名
- **DOCKERHUB_TOKEN**: DockerHub访问令牌
- **SERVER_HOST**: 服务器IP地址或域名
- **SERVER_USERNAME**: SSH用户名
- **SERVER_SSH_KEY**: SSH私钥
- **DB_PASSWORD**: 数据库密码
- **SECRET_KEY**: 应用程序密钥

#### 3.2 手动部署步骤

如需手动部署，请按照以下步骤操作：

1. **克隆仓库**:
   ```bash
   git clone https://github.com/your-username/video-player-app.git
   cd video-player-app
   ```

2. **创建.env文件**:
   ```bash
   cp .env.example .env
   # 编辑.env文件设置所有必要的环境变量
   ```

3. **构建和启动容器**:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

4. **验证部署**:
   ```bash
   # 检查服务健康状态
   curl http://localhost/api/health
   
   # 查看容器日志
   docker-compose -f docker-compose.prod.yml logs
   ```

### 4. 健康检查和监控

系统内置了健康检查端点和脚本:

- **API端点**: `http://your-server/api/health`
- **健康检查脚本**: `python/healthcheck.py`

健康检查返回JSON格式，包含各服务组件状态:
```json
{
  "status": "healthy",
  "database": true,
  "api": true,
  "frontend": true,
  "nginx": true,
  "timestamp": 1646209146.789
}
```

### 5. 故障排除

常见问题及解决方案:

1. **容器启动失败**:
   - 检查日志: `docker-compose -f docker-compose.prod.yml logs <service_name>`
   - 确认环境变量配置正确

2. **数据库连接错误**:
   - 验证.env文件中的数据库凭据
   - 确保PostgreSQL容器正常运行: `docker ps | grep postgres`

3. **无法访问应用**:
   - 检查Nginx配置和日志
   - 确认服务器防火墙设置允许HTTP/HTTPS流量

4. **部署脚本执行失败**:
   - 检查GitHub Actions工作流日志
   - 验证SSH凭据和服务器连接

## 项目目录结构

```
video-player-app/
├── .env.local
├── .git
├── .github
│   └── workflows
│       └── deploy.yml
├── .idea
│   ├── .gitignore
│   ├── inspectionProfiles
│   │   └── profiles_settings.xml
│   ├── modules.xml
│   ├── vcs.xml
│   ├── video-player-app.iml
│   └── workspace.xml
├── Dockerfile
├── README.md
├── app
│   ├── api
│   │   ├── approved-videos
│   │   ├── login
│   │   ├── record-video-time
│   │   ├── register
│   │   ├── submit-rating
│   │   ├── unrated-videos
│   │   └── videos
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── audio_feature_extraction.Dockerfile
├── audio_feature_extraction.py
├── backend
│   ├── Dockerfile
│   ├── ml
│   │   ├── cross_validation.py
│   │   ├── requirements.txt
│   │   ├── run_cross_validation.py
│   │   ├── rvm_regression.py
│   │   └── video_processor.py
│   ├── pom.xml
│   └── src
│       └── main
│           ├── java
│           │   └── com
│           │       └── example
│           │           └── videoplayerapp
│           │               ├── VideoPlayerApplication.java
│           │               ├── controller
│           │               │   ├── ExperimentController.java
│           │               │   └── VideoController.java
│           │               ├── model
│           │               │   ├── Comment.java
│           │               │   ├── Experiment.java
│           │               │   ├── ExperimentData.java
│           │               │   ├── ExperimentVideo.java
│           │               │   ├── PendingVideo.java
│           │               │   ├── Video.java
│           │               │   └── VideoEvaluation.java
│           │               └── service
│           │                   ├── ExperimentService.java
│           │                   └── VideoService.java
│           └── resources
├── components
│   ├── Background3D.tsx
│   ├── ExperimentalVideoPlayer.tsx
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   ├── SAMScale.tsx
│   ├── VideoPlayer.tsx
│   └── ui
│       ├── accordion.tsx
│       ├── alert-dialog.tsx
│       ├── alert.tsx
│       ├── aspect-ratio.tsx
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── breadcrumb.tsx
│       ├── button.tsx
│       ├── calendar.tsx
│       ├── card.tsx
│       ├── carousel.tsx
│       ├── chart.tsx
│       ├── checkbox.tsx
│       ├── collapsible.tsx
│       ├── command.tsx
│       ├── context-menu.tsx
│       ├── dialog.tsx
│       ├── drawer.tsx
│       ├── dropdown-menu.tsx
│       ├── form.tsx
│       ├── hover-card.tsx
│       ├── input-otp.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── menubar.tsx
│       ├── navigation-menu.tsx
│       ├── pagination.tsx
│       ├── popover.tsx
│       ├── progress.tsx
│       ├── radio-group.tsx
│       ├── resizable.tsx
│       ├── scroll-area.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── sidebar.tsx
│       ├── skeleton.tsx
│       ├── slider.tsx
│       ├── sonner.tsx
│       ├── switch.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       ├── textarea.tsx
│       ├── toast.tsx
│       ├── toaster.tsx
│       ├── toggle-group.tsx
│       ├── toggle.tsx
│       ├── tooltip.tsx
│       └── use-mobile.tsx
├── components.json
├── db
│   └── migrations
│       └── 001_create_tables.sql
├── docker-compose.yml
├── frontend
│   ├── Dockerfile
│   ├── index.js
│   ├── node_modules
│   ├── package-lock.json
│   ├── package.json
│   └── webpack.config.js
├── hooks
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── lib
│   ├── db.ts
│   └── utils.ts
├── main.py
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── project-structure.txt
├── public
│   ├── placeholder-logo.png
│   ├── placeholder-logo.svg
│   ├── placeholder-user.jpg
│   ├── placeholder.jpg
│   └── placeholder.svg
├── python
│   ├── feature_extraction.py
│   ├── main.py
│   ├── rvm_analysis.py
│   ├── scrapy_project
│   ├── video_pipeline.py
│   ├── video_processor.py
│   └── video_scraper
├── requirements.txt
├── server_setup.sh
├── src
│   ├── App.vue
│   ├── components
│   ├── main.ts
│   └── views
├── styles
│   ├── VideoPlayer.css
│   └── globals.css
├── tailwind.config.ts
├── tsconfig.json
├── types
│   └── index.ts
├── utils
│   └── fetchUtils.ts
├── v0-user-next.config.js
├── video_feature_extraction.Dockerfile
└── video_feature_extraction.py

### 文件夹和文件内容说明

- **.env.local**: 环境变量文件，用于存储本地开发环境的配置。
- **.git**: Git 版本控制目录，存储版本控制相关的信息。
- **.github**
  - **workflows/deploy.yml**: 定义 GitHub Actions 工作流程，用于自动化部署。
- **.idea**: IDE 配置目录，存储项目的 IDE 设置。
  - **.gitignore**: 指定不应被版本控制系统跟踪的文件和目录。
  - **inspectionProfiles/profiles_settings.xml**: 包含检查项目配置文件管理器的设置。
  - **modules.xml**: 定义项目中模块的配置。
  - **vcs.xml**: 包含版本控制系统的配置。
  - **video-player-app.iml**: IntelliJ IDEA 模块文件，包含模块的基本配置。
  - **workspace.xml**: 保存 IDE 的工作区设置。
- **Dockerfile**: 定义项目的 Docker 配置。
- **README.md**: 项目说明文件，提供项目的基本信息和使用说明。
- **app**: 应用程序目录，包含前端应用的主要代码。
  - **api**: API 端点目录，包含多个子目录，每个子目录对应一个 API 端点。
  - **globals.css**: 全局 CSS 样式文件，用于定义应用程序的基本样式。
  - **layout.tsx**: 定义应用程序的根布局。
  - **page.tsx**: 定义主页组件。
- **audio_feature_extraction.Dockerfile**: 音频特征提取的 Docker 配置文件。
- **audio_feature_extraction.py**: 音频特征提取脚本。
- **backend**: 后端目录，包含后端服务的代码。
  - **Dockerfile**: 定义后端服务的 Docker 配置。
  - **ml**: 机器学习相关代码目录。
    - **cross_validation.py**: 脚本用于交叉验证。
    - **requirements.txt**: 列出 Python 项目的依赖包。
    - **run_cross_validation.py**: 运行交叉验证的脚本。
    - **rvm_regression.py**: RVM 回归算法实现。
    - **video_processor.py**: 视频处理脚本。
  - **pom.xml**: Maven 项目的配置文件，定义了依赖和构建信息。
  - **src**: Java 源代码目录。
    - **main**: 主程序目录。
      - **java/com/example/videoplayerapp**: 包含 Java 后端的主要代码。
        - **VideoPlayerApplication.java**: 主应用程序类。
        - **controller**: 包含控制器类。
        - **model**: 包含数据模型类。
        - **service**: 包含服务类。
      - **resources**: 资源文件目录。
- **components**: 组件目录，包含前端 UI 组件。
  - **Background3D.tsx**: 3D 背景组件。
  - **ExperimentalVideoPlayer.tsx**: 实验性视频播放器组件。
  - **LoginForm.tsx**: 用户登录表单组件。
  - **RegisterForm.tsx**: 用户注册表单组件。
  - **SAMScale.tsx**: SAM 缩放组件。
  - **VideoPlayer.tsx**: 视频播放器组件。
  - **ui**: 包含各种 UI 组件。
- **components.json**: 组件配置文件。
- **db**: 数据库目录。
  - **migrations**: 数据库迁移目录。
    - **001_create_tables.sql**: 数据库迁移脚本。
- **docker-compose.yml**: Docker Compose 配置文件。
- **frontend**: 前端目录，包含前端应用的代码。
  - **Dockerfile**: 前端服务的 Docker 配置文件。
  - **index.js**: 前端应用的入口文件。
  - **node_modules**: 包含项目的所有依赖包。
  - **package-lock.json**: 锁定项目依赖的确切版本。
  - **package.json**: 定义项目的依赖、脚本和元数据。
  - **webpack.config.js**: Webpack 配置文件。
- **hooks**: 自定义钩子目录。
  - **use-mobile.tsx**: 自定义 React Hook，用于检测设备是否为移动设备。
  - **use-toast.ts**: 自定义 React Hook，用于显示通知。
- **lib**: 库文件目录，包含数据库和工具函数。
  - **db.ts**: 数据库相关工具函数。
  - **utils.ts**: 通用工具函数。
- **main.py**: 主程序文件。
- **next.config.mjs**: Next.js 配置文件。
- **package.json**: 项目依赖配置文件。
- **postcss.config.mjs**: PostCSS 配置文件。
- **project-structure.txt**: 项目结构说明文件。
- **public**: 公共资源目录。
  - **placeholder-logo.png**: 占位符 Logo 图片。
  - **placeholder-logo.svg**: 占位符 Logo 图片。
  - **placeholder-user.jpg**: 占位符用户图片。
  - **placeholder.jpg**: 占位符图片。
  - **placeholder.svg**: 占位符图片。
- **python**: Python 脚本目录。
  - **feature_extraction.py**: 特征提取脚本。
  - **main.py**: Python 主程序文件。
  - **rvm_analysis.py**: RVM 分析脚本。
  - **scrapy_project**: Scrapy 项目目录。
  - **video_pipeline.py**: 视频处理管道脚本。
  - **video_processor.py**: 视频处理脚本。
  - **video_scraper**: 视频抓取脚本。
- **requirements.txt**: Python 依赖文件。
- **server_setup.sh**: 服务器设置脚本。
- **src**: 源代码目录。
  - **App.vue**: Vue 应用的主组件。
  - **components**: Vue 组件目录。
  - **main.ts**: Vue 应用的入口文件。
  - **views**: Vue 视图目录。
- **styles**: 样式文件目录。
  - **VideoPlayer.css**: 视频播放器样式文件。
  - **globals.css**: 全局样式文件。
- **tailwind.config.ts**: Tailwind CSS 配置文件。
- **tsconfig.json**: TypeScript 配置文件。
- **types**: 类型定义目录。
  - **index.ts**: 类型定义文件。
- **utils**: 工具函数目录。
  - **fetchUtils.ts**: 数据获取工具函数。
- **v0-user-next.config.js**: 用户配置文件。
- **video_feature_extraction.Dockerfile**: 视频特征提取的 Docker 配置文件。
- **video_feature_extraction.py**: 视频特征提取脚本。

这些文件夹和文件构成了项目的核心功能模块和配置。
