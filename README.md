# Video Player App

This is a Next.js application that allows users to register, login, and watch videos. The app uses PostgreSQL for data storage and includes features like random video selection, SAM scale rating, and tracking of video start and end times.

## 项目重构说明 (2025-03-03)

本项目已进行了重大结构重构，主要变更包括：

1. **前端技术栈统一**
   - 保留 Next.js 作为唯一前端框架
   - Vue.js 组件已归档到 `archived/vue_components`

2. **组件整合与目录优化**
   - 组件已按功能分类整理到专门的目录:
     - `components/experiments`: 实验相关组件
     - `components/forms`: 表单组件
     - `components/media`: 媒体播放器组件
     - `components/ui`: UI 基础组件

3. **工具函数统一**
   - 将原有的 `utils/` 和 `lib/` 合并为单一工具库 `lib/`
   - 重构了重复的功能函数

4. **根目录清理**
   - Python 文件已移至 `python/` 目录，按功能分类
   - Dockerfile 文件移至相应功能目录

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up your PostgreSQL database and update the `.env.local` file with your database URL
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

## 项目结构

```
/video-player-app
├── app/                     # Next.js 应用主目录
│   ├── api/                 # API 路由
│   ├── page.tsx             # 首页
│   └── layout.tsx           # 全局布局
├── components/              # 组件库
│   ├── experiments/         # 实验相关组件
│   │   ├── ExperimentControl.tsx
│   │   ├── ExperimentalVideoPlayer.tsx
│   │   └── SAMScale.tsx
│   ├── forms/               # 表单组件
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── media/               # 媒体相关组件
│   │   ├── VideoPlayer.tsx
│   │   └── SAMVideoPlayer.tsx
│   ├── ui/                  # UI 组件库
│   └── Background3D.tsx     # 3D 背景组件
├── hooks/                   # React Hooks
│   └── useAuth.ts           # 认证 Hook
├── lib/                     # 工具库
│   ├── db.ts                # 数据库操作
│   └── utils.ts             # 通用工具函数
├── public/                  # 静态资源
├── python/                  # Python 后端
│   ├── feature_extraction/  # 特征提取
│   ├── video_scraper/       # 视频爬虫
│   └── config.py            # 配置
├── archived/                # 存档目录
│   ├── vue_components/      # Vue.js 组件存档（原 src 目录）
│   ├── utils_backup/        # 工具库备份
│   └── root_backup/         # 根目录备份文件
├── package.json             # Node.js 项目配置
├── next.config.mjs          # Next.js 配置
└── README.md                # 项目说明
```

### 文件夹和文件内容说明

- **app**: Next.js 应用主目录
  - **api**: API 路由
  - **page.tsx**: 首页
  - **layout.tsx**: 全局布局
- **components**: 组件库
  - **experiments**: 实验相关组件
  - **forms**: 表单组件
  - **media**: 媒体相关组件
  - **ui**: UI 组件库
- **hooks**: React Hooks
  - **useAuth.ts**: 认证 Hook
- **lib**: 工具库
  - **db.ts**: 数据库操作
  - **utils.ts**: 通用工具函数
- **public**: 静态资源
- **python**: Python 后端
  - **feature_extraction**: 特征提取
  - **video_scraper**: 视频爬虫
  - **config.py**: 配置
- **archived**: 存档目录
  - **vue_components**: Vue.js 组件存档（原 src 目录）
  - **utils_backup**: 工具库备份
  - **root_backup**: 根目录备份文件
- **package.json**: Node.js 项目配置
- **next.config.mjs**: Next.js 配置
- **README.md**: 项目说明

这些文件夹和文件构成了项目的核心功能模块和配置。
