package com.example.videoplayerapp.controller;

import com.example.videoplayerapp.model.Video;
import com.example.videoplayerapp.model.ExperimentData;
import com.example.videoplayerapp.service.VideoService;
import com.example.videoplayerapp.service.ExperimentService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/videos")
@Slf4j
public class VideoController {

    @Autowired
    private VideoService videoService;

    @Autowired
    private ExperimentService experimentService;

    /**
     * 获取所有视频
     */
    @GetMapping
    public ResponseEntity<List<Video>> getAllVideos() {
        log.info("请求获取所有视频");
        List<Video> videos = videoService.getAllVideos();
        return ResponseEntity.ok(videos);
    }
    
    /**
     * 根据ID获取视频
     */
    @GetMapping("/{id}")
    public ResponseEntity<Video> getVideoById(@PathVariable Long id) {
        log.info("请求获取视频，ID: {}", id);
        Optional<Video> videoOpt = videoService.getVideoById(id);
        return videoOpt.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * 获取随机实验视频
     * 注意：之前此端点存在于ExperimentController
     */
    @GetMapping("/random")
    public ResponseEntity<List<Video>> getRandomVideos(
            @RequestParam(name = "count", defaultValue = "5") int count) {
        log.info("请求获取随机视频，数量: {}", count);
        List<Video> videos = videoService.getRandomExperimentalVideos(count);
        return ResponseEntity.ok(videos);
    }
    
    /**
     * 创建新视频
     */
    @PostMapping
    public ResponseEntity<Video> createVideo(@RequestBody Video video) {
        log.info("请求创建新视频: {}", video.getTitle());
        Video savedVideo = videoService.saveVideo(video);
        return ResponseEntity.ok(savedVideo);
    }
    
    /**
     * 更新视频信息
     */
    @PutMapping("/{id}")
    public ResponseEntity<Video> updateVideo(
            @PathVariable Long id, 
            @RequestBody Video video) {
        log.info("请求更新视频，ID: {}", id);
        
        Optional<Video> existingVideo = videoService.getVideoById(id);
        if (existingVideo.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        video.setId(id);
        Video updatedVideo = videoService.saveVideo(video);
        return ResponseEntity.ok(updatedVideo);
    }
    
    /**
     * 更新视频情绪分数
     */
    @PatchMapping("/{id}/scores")
    public ResponseEntity<Video> updateVideoScores(
            @PathVariable Long id,
            @RequestParam double valence,
            @RequestParam double arousal) {
        log.info("请求更新视频分数，ID: {}，效价: {}，唤醒度: {}", id, valence, arousal);
        Video updatedVideo = videoService.updateVideoScores(id, valence, arousal);
        
        if (updatedVideo == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(updatedVideo);
    }
    
    /**
     * 删除视频
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVideo(@PathVariable Long id) {
        log.info("请求删除视频，ID: {}", id);
        Optional<Video> videoOpt = videoService.getVideoById(id);
        
        if (videoOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        videoService.deleteVideo(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/upload-eeg")
    public ResponseEntity<Map<String, String>> uploadEEGFile(@RequestParam("file") MultipartFile file) {
        String fileUrl = experimentService.uploadEEGFile(file);
        return ResponseEntity.ok(Map.of("eegFileUrl", fileUrl));
    }

    @PostMapping("/process-experiment")
    public ResponseEntity<Map<String, Object>> processExperiment(@RequestBody ExperimentData experimentData) {
        Map<String, Object> result = experimentService.processExperimentData(experimentData);
        return ResponseEntity.ok(result);
    }
}
