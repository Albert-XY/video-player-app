package com.example.videoplayerapp.utils;

import com.example.videoplayerapp.model.*;
import com.example.videoplayerapp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.*;

/**
 * 视频播放器应用 - 测试数据生成器
 * 此类用于生成示例数据以便在开发和测试环境中使用
 * 
 * 使用方法：
 * 1. 确保Spring Boot应用已配置为开发环境
 * 2. 运行应用，此生成器将自动执行
 */
@Component
public class TestDataGenerator implements CommandLineRunner {

    private final UserRepository userRepository;
    private final VideoRepository videoRepository;
    private final PasswordEncoder passwordEncoder;
    
    private final Random random = new Random();

    @Autowired
    public TestDataGenerator(
            UserRepository userRepository,
            VideoRepository videoRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.videoRepository = videoRepository;
        this.passwordEncoder = passwordEncoder;
    }
    
    @Override
    public void run(String... args) throws Exception {
        if (shouldGenerateTestData()) {
            System.out.println("开始生成测试数据...");
            
            List<User> users = generateUsers();
            generateVideos(10);
            
            System.out.println("测试数据生成完成！");
        }
    }
    
    private boolean shouldGenerateTestData() {
        // 检查是否应该生成测试数据：
        // 1. 确保是开发环境
        // 2. 数据库是否为空（可选）
        boolean isDevelopment = System.getProperty("spring.profiles.active", "").contains("dev") || 
                               System.getProperty("spring.profiles.active", "").contains("development");
                               
        boolean isDatabaseEmpty = userRepository.count() == 0;
        
        return isDevelopment && isDatabaseEmpty;
    }
    
    private List<User> generateUsers() {
        System.out.println("生成用户数据...");
        
        // 准备用户数据
        List<Map<String, Object>> userDataList = new ArrayList<>();
        
        userDataList.add(Map.of(
            "username", "admin",
            "email", "admin@example.com",
            "password", "admin123",
            "fullName", "管理员",
            "isAdmin", true
        ));
        
        userDataList.add(Map.of(
            "username", "user1",
            "email", "user1@example.com",
            "password", "user123",
            "fullName", "测试用户1",
            "isAdmin", false
        ));
        
        userDataList.add(Map.of(
            "username", "user2",
            "email", "user2@example.com",
            "password", "user123",
            "fullName", "测试用户2",
            "isAdmin", false
        ));
        
        List<User> createdUsers = new ArrayList<>();
        
        for (Map<String, Object> userData : userDataList) {
            String username = (String) userData.get("username");
            
            // 检查用户是否已存在
            Optional<User> existingUser = userRepository.findByUsername(username);
            if (existingUser.isPresent()) {
                System.out.println("用户 " + username + " 已存在，跳过创建");
                createdUsers.add(existingUser.get());
                continue;
            }
            
            User user = new User();
            user.setUsername(username);
            user.setEmail((String) userData.get("email"));
            user.setPassword(passwordEncoder.encode((String) userData.get("password")));
            user.setFullName((String) userData.get("fullName"));
            user.setRole(((Boolean) userData.getOrDefault("isAdmin", false)) ? "ADMIN" : "USER");
            user.setActive(true);
            user.setCreatedAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());
            
            userRepository.save(user);
            createdUsers.add(user);
            System.out.println("创建用户: " + username);
        }
        
        return createdUsers;
    }
    
    private List<Video> generateVideos(int count) {
        System.out.println("生成视频数据...");
        
        // 准备标题
        List<String> titles = Arrays.asList(
            "初学者Python教程",
            "高级JavaScript技巧",
            "React框架入门到精通",
            "Vue.js实战项目开发",
            "数据结构与算法",
            "机器学习基础",
            "深度学习实战",
            "Web前端开发最佳实践",
            "后端开发技术栈",
            "DevOps与CI/CD"
        );
        
        // 准备视频路径
        List<String> videoPaths = Arrays.asList(
            "/videos/sample-5s.mp4",
            "/videos/sample-10s.mp4",
            "/videos/sample-15s.mp4",
            "/videos/sample-20s.mp4",
            "/videos/sample-30s.mp4"
        );
        
        List<Video> createdVideos = new ArrayList<>();
        
        // 确保不超过可用标题数量
        int actualCount = Math.min(count, titles.size());
        
        for (int i = 0; i < actualCount; i++) {
            String title = titles.get(i);
            
            // 由于VideoRepository没有findByTitle方法，这里使用list筛选
            List<Video> allVideos = videoRepository.findAll();
            boolean videoExists = allVideos.stream()
                .anyMatch(v -> v.getTitle() != null && v.getTitle().equals(title));
                
            if (videoExists) {
                System.out.println("视频 '" + title + "' 已存在，跳过创建");
                continue;
            }
            
            // 随机选择路径和评分值
            String path = videoPaths.get(random.nextInt(videoPaths.size()));
            double valence = 1 + random.nextInt(9); // 1-9的随机值
            double arousal = 1 + random.nextInt(9); // 1-9的随机值
            
            // 使用带参数的构造函数创建Video对象
            Video video = new Video(path, title, valence, arousal);
            
            videoRepository.save(video);
            createdVideos.add(video);
            System.out.println("创建视频: " + title);
        }
        
        return createdVideos;
    }
}
