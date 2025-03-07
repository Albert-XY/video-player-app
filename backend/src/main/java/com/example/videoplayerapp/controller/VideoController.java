package com.example.videoplayerapp.controller;

import com.example.videoplayerapp.model.Video;
import com.example.videoplayerapp.model.ExperimentData;
import com.example.videoplayerapp.service.VideoService;
import com.example.videoplayerapp.service.ExperimentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class VideoController {

    @Autowired
    private VideoService videoService;

    @Autowired
    private ExperimentService experimentService;

    @GetMapping("/videos/experimental")
    public ResponseEntity<List<Video>> getExperimentalVideos() {
        List<Video> videos = videoService.getRandomExperimentalVideos(5);
        return ResponseEntity.ok(videos);
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

