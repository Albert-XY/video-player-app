/**
 * 应用全局配置
 */

// 后端API地址
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// 健康检查端点
export const HEALTH_CHECK_ENDPOINT = `${API_BASE_URL}/api/health`;

// 认证相关端点
export const AUTH_ENDPOINTS = {
  login: `${API_BASE_URL}/api/login`,
  register: `${API_BASE_URL}/api/register`,
  logout: `${API_BASE_URL}/api/logout`
};

// 视频相关端点
export const VIDEO_ENDPOINTS = {
  list: `${API_BASE_URL}/api/videos`,
  experimental: `${API_BASE_URL}/api/videos/experimental`,
  upload: `${API_BASE_URL}/api/videos/upload`,
  detail: (id: string) => `${API_BASE_URL}/api/videos/${id}`
};

// 实验相关端点
export const EXPERIMENT_ENDPOINTS = {
  list: `${API_BASE_URL}/api/experiments`,
  upload: `${API_BASE_URL}/api/experiments/eeg`,
  crossValidation: `${API_BASE_URL}/api/experiments/cross-validation`
};
