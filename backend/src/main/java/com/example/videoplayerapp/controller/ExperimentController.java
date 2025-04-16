package com.example.videoplayerapp.controller;

import com.example.videoplayerapp.model.ExperimentData;
import com.example.videoplayerapp.model.Video;
import com.example.videoplayerapp.service.ExperimentService;
import com.example.videoplayerapp.service.VideoService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/experiments")
@Slf4j
public class ExperimentController {

    @Autowired
    private VideoService videoService;

    @Autowired
    private ExperimentService experimentService;

    /**
     * 获取实验视频列表
     * 注意：与VideoController共享功能，但路径不同
     */
    @GetMapping("/videos")
    public ResponseEntity<List<Video>> getExperimentalVideos(
            @RequestParam(name = "count", defaultValue = "5") int count) {
        log.info("请求获取{}个实验视频", count);
        List<Video> videos = videoService.getRandomExperimentalVideos(count);
        return ResponseEntity.ok(videos);
    }

    /**
     * 上传EEG文件
     */
    @PostMapping("/upload-eeg")
    public ResponseEntity<Map<String, String>> uploadEEGFile(@RequestParam("file") MultipartFile file) {
        log.info("上传EEG文件: {}", file.getOriginalFilename());
        String fileUrl = experimentService.uploadEEGFile(file);
        return ResponseEntity.ok(Map.of("eegFileUrl", fileUrl));
    }

    /**
     * 处理实验数据
     */
    @PostMapping("/process")
    public ResponseEntity<Map<String, Object>> processExperiment(@RequestBody ExperimentData experimentData) {
        log.info("处理实验数据: {}", experimentData);
        Map<String, Object> result = experimentService.processExperimentData(experimentData);
        return ResponseEntity.ok(result);
    }

    /**
     * 运行交叉验证
     */
    @PostMapping("/cross-validation")
    public ResponseEntity<Map<String, Object>> runCrossValidation(@RequestParam("dataPath") String dataPath) {
        log.info("运行交叉验证，数据路径: {}", dataPath);
        Map<String, Object> result = experimentService.runCrossValidation(dataPath);
        return ResponseEntity.ok(result);
    }
}
