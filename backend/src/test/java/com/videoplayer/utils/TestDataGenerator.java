package com.videoplayer.utils;

import com.videoplayer.model.*;
import com.videoplayer.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

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
    private final CategoryRepository categoryRepository;
    private final CommentRepository commentRepository;
    private final PlaylistRepository playlistRepository;
    private final UserActivityRepository activityRepository;
    private final PasswordEncoder passwordEncoder;
    
    private final Random random = new Random();

    @Autowired
    public TestDataGenerator(
            UserRepository userRepository,
            VideoRepository videoRepository,
            CategoryRepository categoryRepository,
            CommentRepository commentRepository,
            PlaylistRepository playlistRepository,
            UserActivityRepository activityRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.videoRepository = videoRepository;
        this.categoryRepository = categoryRepository;
        this.commentRepository = commentRepository;
        this.playlistRepository = playlistRepository;
        this.activityRepository = activityRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // 只在开发环境中生成测试数据
        if (shouldGenerateTestData()) {
            System.out.println("开始生成测试数据...");
            
            List<User> users = generateUsers();
            List<Category> categories = generateCategories();
            List<Video> videos = generateVideos(users, categories, 30);
            generateComments(users, videos, 100);
            generatePlaylists(users, videos, 15);
            generateUserActivities(users, videos, 200);
            
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
        
        userDataList.add(Map.of(
            "username", "videomaker",
            "email", "creator@example.com",
            "password", "creator123",
            "fullName", "视频创作者",
            "isAdmin", false
        ));
        
        userDataList.add(Map.of(
            "username", "commenter",
            "email", "comment@example.com",
            "password", "comment123",
            "fullName", "评论者",
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
            user.setAdmin((Boolean) userData.getOrDefault("isAdmin", false));
            user.setActive(true);
            user.setCreatedAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());
            
            userRepository.save(user);
            createdUsers.add(user);
            System.out.println("创建用户: " + username);
        }
        
        return createdUsers;
    }
    
    private List<Category> generateCategories() {
        System.out.println("生成视频分类数据...");
        
        // 准备分类数据
        List<Map<String, String>> categoryDataList = new ArrayList<>();
        
        categoryDataList.add(Map.of("name", "教育", "description", "教育类视频"));
        categoryDataList.add(Map.of("name", "娱乐", "description", "娱乐类视频"));
        categoryDataList.add(Map.of("name", "音乐", "description", "音乐类视频"));
        categoryDataList.add(Map.of("name", "科技", "description", "科技类视频"));
        categoryDataList.add(Map.of("name", "游戏", "description", "游戏类视频"));
        categoryDataList.add(Map.of("name", "体育", "description", "体育类视频"));
        categoryDataList.add(Map.of("name", "电影", "description", "电影类视频"));
        categoryDataList.add(Map.of("name", "动画", "description", "动画类视频"));
        
        List<Category> createdCategories = new ArrayList<>();
        
        for (Map<String, String> categoryData : categoryDataList) {
            String name = categoryData.get("name");
            
            // 检查分类是否已存在
            Optional<Category> existingCategory = categoryRepository.findByName(name);
            if (existingCategory.isPresent()) {
                System.out.println("分类 " + name + " 已存在，跳过创建");
                createdCategories.add(existingCategory.get());
                continue;
            }
            
            Category category = new Category();
            category.setName(name);
            category.setDescription(categoryData.get("description"));
            category.setCreatedAt(LocalDateTime.now());
            
            categoryRepository.save(category);
            createdCategories.add(category);
            System.out.println("创建分类: " + name);
        }
        
        return createdCategories;
    }
    
    private List<Video> generateVideos(List<User> users, List<Category> categories, int count) {
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
            "DevOps与CI/CD",
            "区块链技术原理",
            "云计算与微服务架构",
            "移动应用开发教程",
            "数据库优化与管理",
            "网络安全基础",
            "操作系统原理",
            "计算机网络基础",
            "软件工程与项目管理",
            "UI/UX设计原则",
            "游戏开发入门"
        );
        
        // 准备描述模板
        List<String> descriptionTemplates = Arrays.asList(
            "本视频详细介绍了{topic}的基础知识，适合初学者。",
            "深入探讨{topic}的高级应用，提供实用技巧。",
            "全面讲解{topic}的核心概念和实际应用场景。",
            "通过实际项目演示{topic}的开发流程和最佳实践。",
            "{topic}完整教程，从入门到精通的学习路径。",
            "解析{topic}中常见的问题和解决方案。",
            "剖析{topic}的底层原理和实现机制。",
            "{topic}专业指南，帮助你快速掌握关键技能。",
            "探索{topic}的前沿发展和未来趋势。",
            "{topic}实战案例分析，提升实际开发能力。"
        );
        
        // 准备视频URL
        List<String> videoUrls = Arrays.asList(
            "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
            "https://samplelib.com/lib/preview/mp4/sample-10s.mp4",
            "https://samplelib.com/lib/preview/mp4/sample-15s.mp4",
            "https://samplelib.com/lib/preview/mp4/sample-20s.mp4",
            "https://samplelib.com/lib/preview/mp4/sample-30s.mp4",
            "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4",
            "https://file-examples.com/storage/fe8c7eef0c6364f6c9504cc/2017/04/file_example_MP4_480_1_5MG.mp4",
            "https://file-examples.com/storage/fe8c7eef0c6364f6c9504cc/2017/04/file_example_MP4_640_3MG.mp4",
            "https://file-examples.com/storage/fe8c7eef0c6364f6c9504cc/2017/04/file_example_MP4_1280_10MG.mp4",
            "https://file-examples.com/storage/fe8c7eef0c6364f6c9504cc/2017/04/file_example_MP4_1920_18MG.mp4"
        );
        
        // 准备缩略图URL
        List<String> thumbnailUrls = Arrays.asList(
            "https://via.placeholder.com/320x180?text=Video+Thumbnail+1",
            "https://via.placeholder.com/320x180?text=Video+Thumbnail+2",
            "https://via.placeholder.com/320x180?text=Video+Thumbnail+3",
            "https://via.placeholder.com/320x180?text=Video+Thumbnail+4",
            "https://via.placeholder.com/320x180?text=Video+Thumbnail+5",
            "https://via.placeholder.com/320x180?text=Video+Thumbnail+6",
            "https://via.placeholder.com/320x180?text=Video+Thumbnail+7",
            "https://via.placeholder.com/320x180?text=Video+Thumbnail+8",
            "https://via.placeholder.com/320x180?text=Video+Thumbnail+9",
            "https://via.placeholder.com/320x180?text=Video+Thumbnail+10"
        );
        
        List<Video> createdVideos = new ArrayList<>();
        
        for (int i = 0; i < count; i++) {
            String baseTitle = titles.get(random.nextInt(titles.size()));
            String title = baseTitle + " (" + (i+1) + ")";
            
            String descriptionTemplate = descriptionTemplates.get(random.nextInt(descriptionTemplates.size()));
            String topic = baseTitle.split(" ")[0]; // 使用标题的第一个词作为主题
            String description = descriptionTemplate.replace("{topic}", topic);
            
            User user = users.get(random.nextInt(users.size()));
            Category category = categories.get(random.nextInt(categories.size()));
            String url = videoUrls.get(random.nextInt(videoUrls.size()));
            String thumbnail = thumbnailUrls.get(random.nextInt(thumbnailUrls.size()));
            
            // 生成随机时长（30秒到30分钟）
            int duration = random.nextInt(1771) + 30;
            
            // 生成随机观看次数
            int views = random.nextInt(9991) + 10;
            
            // 生成随机评分（1-5星）
            double rating = Math.round((random.nextDouble() * 4 + 1) * 10) / 10.0;
            
            // 生成随机创建时间（过去1-100天内）
            LocalDateTime createdAt = LocalDateTime.now().minusDays(random.nextInt(100) + 1);
            
            Video video = new Video();
            video.setTitle(title);
            video.setDescription(description);
            video.setUrl(url);
            video.setThumbnail(thumbnail);
            video.setDuration(duration);
            video.setUser(user);
            video.setCategory(category);
            video.setViews(views);
            video.setRating(rating);
            video.setCreatedAt(createdAt);
            video.setUpdatedAt(LocalDateTime.now());
            
            videoRepository.save(video);
            createdVideos.add(video);
            System.out.println("创建视频: " + title);
        }
        
        return createdVideos;
    }
    
    private void generateComments(List<User> users, List<Video> videos, int count) {
        System.out.println("生成评论数据...");
        
        // 准备评论模板
        List<String> commentTemplates = Arrays.asList(
            "很棒的视频，学到了很多！",
            "讲解非常清晰，谢谢分享。",
            "内容有点深奥，希望能有更详细的解释。",
            "这个主题很有意思，期待更多相关内容。",
            "视频质量很高，音质也不错。",
            "讲得太快了，希望能放慢一点。",
            "非常实用的知识点，已经收藏了。",
            "这个例子很好地说明了核心概念。",
            "希望能有更多的实际案例分析。",
            "讲解方式很生动，容易理解。",
            "内容组织得很好，逻辑清晰。",
            "我有一个问题，{topic}如何应用在实际项目中？",
            "这个技术对初学者友好吗？",
            "视频时长适中，内容充实。",
            "我在实践中遇到了一些问题，希望有更详细的错误处理说明。"
        );
        
        for (int i = 0; i < count; i++) {
            User user = users.get(random.nextInt(users.size()));
            Video video = videos.get(random.nextInt(videos.size()));
            
            String commentTemplate = commentTemplates.get(random.nextInt(commentTemplates.size()));
            String topic = video.getTitle().split(" ")[0]; // 使用视频标题的第一个词作为主题
            String commentText = commentTemplate.replace("{topic}", topic);
            
            // 生成随机评论时间（在视频创建时间之后）
            LocalDateTime videoCreatedAt = video.getCreatedAt();
            long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(videoCreatedAt, LocalDateTime.now());
            int daysAfterVideo = daysBetween > 0 ? random.nextInt((int)daysBetween) : 0;
            LocalDateTime commentDate = videoCreatedAt.plusDays(daysAfterVideo);
            
            Comment comment = new Comment();
            comment.setContent(commentText);
            comment.setUser(user);
            comment.setVideo(video);
            comment.setCreatedAt(commentDate);
            
            commentRepository.save(comment);
            
            if (i % 10 == 0) {
                System.out.println("已创建 " + i + " 条评论...");
            }
        }
        
        System.out.println("总共创建了 " + count + " 条评论");
    }
    
    private void generatePlaylists(List<User> users, List<Video> videos, int count) {
        System.out.println("生成播放列表数据...");
        
        for (int i = 0; i < count; i++) {
            User user = users.get(random.nextInt(users.size()));
            String playlistName = user.getUsername() + "的播放列表 " + (i+1);
            
            // 为播放列表随机选择1-10个视频
            List<Video> allVideos = new ArrayList<>(videos);
            Collections.shuffle(allVideos);
            int videoCount = Math.min(random.nextInt(10) + 1, allVideos.size());
            List<Video> playlistVideos = allVideos.subList(0, videoCount);
            
            Playlist playlist = new Playlist();
            playlist.setName(playlistName);
            playlist.setDescription(user.getUsername() + "创建的视频集合");
            playlist.setUser(user);
            playlist.setCreatedAt(LocalDateTime.now());
            playlist.setUpdatedAt(LocalDateTime.now());
            
            // 保存播放列表
            playlistRepository.save(playlist);
            
            // 添加视频到播放列表
            playlist.setVideos(new HashSet<>(playlistVideos));
            playlistRepository.save(playlist);
            
            System.out.println("创建播放列表: " + playlistName + "，包含 " + videoCount + " 个视频");
        }
    }
    
    private void generateUserActivities(List<User> users, List<Video> videos, int count) {
        System.out.println("生成用户活动数据...");
        
        String[] activityTypes = {"view", "like", "share", "save"};
        
        for (int i = 0; i < count; i++) {
            User user = users.get(random.nextInt(users.size()));
            Video video = videos.get(random.nextInt(videos.size()));
            String activityType = activityTypes[random.nextInt(activityTypes.length)];
            
            // 生成随机活动时间（在视频创建时间之后）
            LocalDateTime videoCreatedAt = video.getCreatedAt();
            long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(videoCreatedAt, LocalDateTime.now());
            int daysAfterVideo = daysBetween > 0 ? random.nextInt((int)daysBetween) : 0;
            LocalDateTime activityDate = videoCreatedAt.plusDays(daysAfterVideo);
            
            UserActivity activity = new UserActivity();
            activity.setUser(user);
            activity.setVideo(video);
            activity.setActivityType(activityType);
            activity.setCreatedAt(activityDate);
            
            activityRepository.save(activity);
            
            if (i % 20 == 0) {
                System.out.println("已创建 " + i + " 条用户活动记录...");
            }
        }
        
        System.out.println("总共创建了 " + count + " 条用户活动记录");
    }
}
