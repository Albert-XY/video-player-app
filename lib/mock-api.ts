/**
 * 模拟API服务
 * 用于在本地测试时提供模拟数据，避免依赖后端服务
 */

import mockData from '../public/mock-data/videos.json';

// 模拟API延迟
const simulateDelay = async (ms = 300) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export interface Video {
  id: number;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  duration: number;
  views: number;
  rating: number;
  userId: number;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  isAdmin: boolean;
}

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface Comment {
  id: number;
  content: string;
  userId: number;
  videoId: number;
  createdAt: string;
}

// 模拟API服务
export const mockApi = {
  // 获取所有视频
  async getVideos(): Promise<Video[]> {
    await simulateDelay();
    return mockData.videos;
  },

  // 获取单个视频
  async getVideo(id: number): Promise<Video | null> {
    await simulateDelay();
    const video = mockData.videos.find(v => v.id === id);
    return video || null;
  },

  // 获取视频评论
  async getVideoComments(videoId: number): Promise<Comment[]> {
    await simulateDelay();
    return mockData.comments.filter(c => c.videoId === videoId);
  },

  // 获取用户信息
  async getUser(id: number): Promise<User | null> {
    await simulateDelay();
    const user = mockData.users.find(u => u.id === id);
    return user || null;
  },

  // 获取分类
  async getCategory(id: number): Promise<Category | null> {
    await simulateDelay();
    const category = mockData.categories.find(c => c.id === id);
    return category || null;
  },

  // 搜索视频
  async searchVideos(query: string): Promise<Video[]> {
    await simulateDelay();
    if (!query) return mockData.videos;
    
    const lowerQuery = query.toLowerCase();
    return mockData.videos.filter(
      v => v.title.toLowerCase().includes(lowerQuery) || 
           v.description.toLowerCase().includes(lowerQuery)
    );
  },

  // 增加观看次数
  async incrementViews(videoId: number): Promise<void> {
    await simulateDelay();
    const video = mockData.videos.find(v => v.id === videoId);
    if (video) {
      video.views += 1;
    }
  }
};

// 导出模拟数据以便直接使用
export const mockDataExport = {
  videos: mockData.videos,
  users: mockData.users,
  categories: mockData.categories,
  comments: mockData.comments
};

export default mockApi;
