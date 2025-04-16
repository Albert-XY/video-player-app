package com.example.videoplayerapp.service;

import com.example.videoplayerapp.model.Video;
import com.example.videoplayerapp.repository.VideoRepository;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityManager;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
public class VideoService {

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private VideoRepository videoRepository;
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @PostConstruct
    @Transactional
    public void init() {
        try {
            log.info("初始化VideoService...");
            // 检查是否已有数据
            Long count = 0L;
            try {
                count = (Long) entityManager.createQuery("SELECT COUNT(v) FROM Video v").getSingleResult();
                log.info("当前视频数据库中有 {} 条记录", count);
            } catch (Exception e) {
                log.error("查询视频数量失败: {}", e.getMessage());
                // 忽略错误，继续初始化
            }
            
            if (count == 0) {
                log.info("开始初始化示例数据...");
                // 初始化示例数据
                List<Video> videos = new ArrayList<>();
                videos.add(new Video("path/to/video1.mp4", "Video 1", 2.5, 2.5));
                videos.add(new Video("path/to/video2.mp4", "Video 2", 7.5, 7.5));
                videos.add(new Video("path/to/video3.mp4", "Video 3", 7.5, 2.5));
                videos.add(new Video("path/to/video4.mp4", "Video 4", 2.5, 7.5));
                videos.add(new Video("path/to/video5.mp4", "Video 5", 2.5, 2.5));
                videos.add(new Video("path/to/video6.mp4", "Video 6", 7.5, 7.5));
                
                try {
                    for (Video video : videos) {
                        entityManager.persist(video);
                    }
                    log.info("初始化示例数据完成");
                } catch (Exception e) {
                    log.error("初始化示例数据失败: {}", e.getMessage());
                    // 忽略错误，让应用继续启动
                }
            }
        } catch (Exception e) {
            log.error("VideoService初始化过程中出现错误", e);
            // 捕获所有异常，确保应用能够启动
        }
    }

    @Transactional(readOnly = true)
    public List<Video> getRandomExperimentalVideos(int count) {
        try {
            List<Video> allVideos = entityManager.createQuery("SELECT v FROM Video v", Video.class)
                                          .getResultList();
            List<Video> shuffledVideos = new ArrayList<>(allVideos);
            Collections.shuffle(shuffledVideos);
            return shuffledVideos.subList(0, Math.min(count, shuffledVideos.size()));
        } catch (Exception e) {
            log.error("获取随机实验视频失败", e);
            return new ArrayList<>(); // 返回空列表避免异常
        }
    }

    public void processVideoMetrics(String videoId) {
        try {
            Object valenceObj = redisTemplate.opsForValue().get("valence_" + videoId);
            Object arousalObj = redisTemplate.opsForValue().get("arousal_" + videoId);
            
            if (valenceObj != null && arousalObj != null) {
                double valenceScore = Double.parseDouble(valenceObj.toString());
                double arousalScore = Double.parseDouble(arousalObj.toString());
                // ... 处理其他指标
            }
        } catch (Exception e) {
            log.error("处理视频指标失败: videoId={}", videoId, e);
            // 忽略错误，避免中断操作
        }
    }

    public List<Video> getAllVideos() {
        try {
            return videoRepository.findAll();
        } catch (Exception e) {
            log.error("获取所有视频失败", e);
            return new ArrayList<>();
        }
    }
    
    public Optional<Video> getVideoById(Long id) {
        try {
            return videoRepository.findById(id);
        } catch (Exception e) {
            log.error("通过ID获取视频失败: id={}", id, e);
            return Optional.empty();
        }
    }
    
    public Video saveVideo(Video video) {
        try {
            return videoRepository.save(video);
        } catch (Exception e) {
            log.error("保存视频失败", e);
            throw e; // 重新抛出异常，因为调用者可能需要处理
        }
    }
    
    public void deleteVideo(Long id) {
        try {
            videoRepository.deleteById(id);
        } catch (Exception e) {
            log.error("删除视频失败: id={}", id, e);
            // 忽略错误，避免中断操作
        }
    }
    
    public Video updateVideoScores(Long id, double valence, double arousal) {
        try {
            Optional<Video> videoOpt = videoRepository.findById(id);
            if (videoOpt.isPresent()) {
                Video video = videoOpt.get();
                video.updateScores(valence, arousal);
                return videoRepository.save(video);
            }
            return null;
        } catch (Exception e) {
            log.error("更新视频分数失败: id={}", id, e);
            return null;
        }
    }
    
    // 缓存视频列表
    public void cacheVideos(List<Video> videos) {
        try {
            redisTemplate.opsForValue().set("all_videos", videos);
        } catch (Exception e) {
            log.error("缓存视频列表失败", e);
            // 忽略错误，避免中断操作
        }
    }
    
    // 从缓存获取视频列表
    @SuppressWarnings("unchecked")
    public List<Video> getCachedVideos() {
        try {
            Object cachedVideos = redisTemplate.opsForValue().get("all_videos");
            if (cachedVideos instanceof List) {
                return (List<Video>) cachedVideos;
            }
        } catch (Exception e) {
            log.error("从缓存获取视频列表失败", e);
            // 忽略错误，返回空列表
        }
        return new ArrayList<>();
    }
}
