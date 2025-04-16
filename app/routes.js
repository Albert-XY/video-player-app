/**
 * 应用路由配置文件
 * 
 * 定义应用中所有页面路由，便于统一管理和引用
 */

// 认证相关路由
export const AUTH_ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
};

// 实验相关路由
export const EXPERIMENT_ROUTES = {
  SAM: '/experiments/sam',
  REGULAR: '/experiments/regular',
};

// API路由
export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
  },
  VIDEOS: {
    LIST: '/api/videos',
    APPROVED: '/api/videos/approved',
    UNRATED: '/api/videos/unrated',
    RATINGS: '/api/videos/ratings',
    STATS: '/api/videos/stats',
  },
  EXPERIMENTS: {
    SAM: '/api/experiments/sam',
    RECORD: '/api/experiments/record',
  },
};

// 为保证向后兼容性，记录旧路由到新路由的映射
export const LEGACY_ROUTE_MAPPING = {
  '/api/login': API_ROUTES.AUTH.LOGIN,
  '/api/register': API_ROUTES.AUTH.REGISTER,
  '/api/unrated-videos': API_ROUTES.VIDEOS.UNRATED,
  '/api/approved-videos': API_ROUTES.VIDEOS.APPROVED,
  '/api/sam-ratings': API_ROUTES.EXPERIMENTS.SAM,
  '/api/record-video-time': API_ROUTES.EXPERIMENTS.RECORD,
};
