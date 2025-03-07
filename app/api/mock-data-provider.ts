// 模拟数据提供者，用于Docker构建和无数据库环境

// 模拟视频数据
export const mockVideos = [
  {
    id: "1",
    title: "测试视频 1",
    src: "/videos/sample1.mp4",
    thumbnail: "/thumbnails/sample1.jpg",
    duration: 120,
    views: 1500,
    uploadDate: "2024-02-15"
  },
  {
    id: "2",
    title: "测试视频 2",
    src: "/videos/sample2.mp4",
    thumbnail: "/thumbnails/sample2.jpg",
    duration: 180,
    views: 2400,
    uploadDate: "2024-02-20"
  },
  {
    id: "3",
    title: "测试视频 3",
    src: "/videos/sample3.mp4",
    thumbnail: "/thumbnails/sample3.jpg",
    duration: 240,
    views: 3200,
    uploadDate: "2024-03-01"
  }
];

// 模拟用户数据
export const mockUsers = [
  {
    id: 1,
    username: "user1",
    email: "user1@example.com"
  },
  {
    id: 2,
    username: "user2",
    email: "user2@example.com"
  }
];

// 检查是否应该使用模拟数据
export function shouldUseMockData() {
  return process.env.NEXT_PUBLIC_SKIP_DB_CONNECTION === "true";
}

// 通用延迟函数，模拟API响应时间
export async function mockDelay(ms = 300) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
