package com.example.videoplayerapp.service;

import com.example.videoplayerapp.model.*;
import com.example.videoplayerapp.repository.VideoEvaluationRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.ResourceLoader;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import lombok.extern.slf4j.Slf4j;

import java.io.*;
import java.util.*;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;

@Service
@Slf4j
public class ExperimentService {

    @Autowired
    private ResourceLoader resourceLoader;
    
    @Autowired
    private EntityManager entityManager;

    @Autowired
    private VideoEvaluationRepository evaluationRepository;

    private static final String RVM_MODEL_PATH = "backend/ml/models/rvm_model.joblib";
    private static final String PYTHON_SCRIPT = "backend/ml/video_processor.py";
    private static final double SQUARE_SUM_THRESHOLD = 5.0;
    private static final int MAX_PENDING_VIDEOS = 50;
    private static final double VARIANCE_THRESHOLD = 1.0;

    public String uploadEEGFile(MultipartFile file) {
        // 实现文件上传逻辑
        String filePath = "uploads/" + file.getOriginalFilename();
        try {
            file.transferTo(Paths.get(filePath));
            return filePath;
        } catch (IOException e) {
            log.error("Failed to save EEG file", e);
            throw new RuntimeException("Failed to save file", e);
        }
    }

    @Transactional
    public Map<String, Object> processExperimentData(ExperimentData experimentData) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 1. 提取EEG特征
            String eegFeatures = extractEEGFeatures(experimentData.getEegFileUrl());
            
            // 2. 使用RVM模型评估视频
            double predictedScore = evaluateVideoWithRVM(eegFeatures);
            
            // 3. 创建视频评估记录
            Video video = entityManager.find(Video.class, experimentData.getVideoId());
            if (video == null) {
                result.put("status", "error");
                result.put("message", "视频不存在");
                return result;
            }
            
            VideoEvaluation evaluation = new VideoEvaluation();
            evaluation.setVideo(video);
            evaluation.setValence((int) predictedScore);  // 使用RVM预测的评分
            evaluation.setArousal(experimentData.getArousal()); // SAM量表评分
            
            entityManager.persist(evaluation);
            
            result.put("status", "success");
            result.put("message", "实验数据处理完成");
            result.put("predictedScore", predictedScore);
            
        } catch (Exception e) {
            log.error("Failed to process experiment data", e);
            result.put("status", "error");
            result.put("message", "处理失败: " + e.getMessage());
        }
        
        return result;
    }
    
    private String extractEEGFeatures(String eegFilePath) {
        // 实现EEG特征提取
        // 这里应该调用你的EEG特征提取代码
        // 返回特征向量的字符串表示
        return ""; // TODO: 实现特征提取
    }
    
    private double evaluateVideoWithRVM(String features) throws IOException, InterruptedException {
        // 调用Python脚本进行RVM评估
        ProcessBuilder pb = new ProcessBuilder(
            "python",
            PYTHON_SCRIPT,
            "--features", features,
            "--model", RVM_MODEL_PATH
        );
        
        Process process = pb.start();
        int exitCode = process.waitFor();
        
        if (exitCode != 0) {
            throw new RuntimeException("RVM评估失败");
        }
        
        // 读取Python脚本的输出
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(process.getInputStream()))) {
            String output = reader.readLine();
            return Double.parseDouble(output);
        }
    }

    @Transactional
    public Map<String, Object> trainRVMModel(String dataPath) {
        Map<String, Object> result = new HashMap<>();
        try {
            // 调用Python脚本训练RVM模型
            ProcessBuilder pb = new ProcessBuilder(
                "python",
                PYTHON_SCRIPT,
                "train",
                dataPath,
                RVM_MODEL_PATH
            );
            
            Process process = pb.start();
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String output = reader.readLine();
            
            int exitCode = process.waitFor();
            if (exitCode != 0) {
                throw new RuntimeException("RVM training failed");
            }
            
            result.put("status", "success");
            result.put("message", "RVM model trained successfully");
        } catch (IOException | InterruptedException e) {
            result.put("status", "error");
            result.put("message", "Training failed: " + e.getMessage());
        }
        return result;
    }

    @Transactional
    public Map<String, Object> processNewVideo(String videoPath) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 1. 检查待处理视频数量
            Query countQuery = entityManager.createQuery("SELECT COUNT(p) FROM PendingVideo p");
            Long count = (Long) countQuery.getSingleResult();
            if (count >= MAX_PENDING_VIDEOS) {
                result.put("status", "error");
                result.put("message", "待处理视频数量已达到上限");
                return result;
            }
            
            // 2. 创建待处理视频记录
            PendingVideo pendingVideo = new PendingVideo();
            pendingVideo.setPath(videoPath);
            pendingVideo.setValence(0.0);  // 初始值
            pendingVideo.setArousal(0.0);  // 初始值
            pendingVideo.setUploadTime(LocalDateTime.now());
            
            entityManager.persist(pendingVideo);
            
            result.put("status", "success");
            result.put("message", "视频已添加到待处理队列");
            result.put("pendingVideoId", pendingVideo.getId());
            
        } catch (Exception e) {
            log.error("Failed to process new video", e);
            result.put("status", "error");
            result.put("message", "处理失败: " + e.getMessage());
        }
        
        return result;
    }
    
    @Transactional
    public Map<String, Object> processSAMEvaluation(Long pendingVideoId, double samValence, double samArousal) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 1. 获取待处理视频
            PendingVideo pendingVideo = entityManager.find(PendingVideo.class, pendingVideoId);
            if (pendingVideo == null) {
                result.put("status", "error");
                result.put("message", "待处理视频不存在");
                return result;
            }
            
            // 2. 创建新的视频记录
            Video video = new Video(
                pendingVideo.getPath(),
                "新视频 " + pendingVideoId,
                pendingVideo.getValence(),
                pendingVideo.getArousal()
            );
            
            // 3. 设置视频属性
            video.setLabel(calculateLabel(pendingVideo.getValence(), pendingVideo.getArousal()));
            video.setValence(pendingVideo.getValence());
            video.setArousal(pendingVideo.getArousal());
            
            // 4. 保存视频
            entityManager.persist(video);
            
            // 5. 删除待处理视频
            entityManager.remove(pendingVideo);
            
            result.put("status", "success");
            result.put("message", "视频评估完成");
            result.put("videoId", video.getId());
            
        } catch (Exception e) {
            log.error("Failed to process SAM evaluation", e);
            result.put("status", "error");
            result.put("message", "处理失败: " + e.getMessage());
        }
        
        return result;
    }
    
    private String calculateLabel(double valence, double arousal) {
        if (valence >= 5 && arousal >= 5) {
            return "HAHV";
        } else if (valence >= 5 && arousal < 5) {
            return "HALV";
        } else if (valence < 5 && arousal >= 5) {
            return "LAHV";
        } else {
            return "LALV";
        }
    }
    
    @Transactional
    public Map<String, Object> trainRVMModel(String videoListPath, String labelsPath) {
        Map<String, Object> result = new HashMap<>();
        try {
            ProcessBuilder pb = new ProcessBuilder(
                "python",
                PYTHON_SCRIPT,
                "train",
                videoListPath,
                labelsPath
            );
            
            Process process = pb.start();
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            StringBuilder output = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }
            
            int exitCode = process.waitFor();
            if (exitCode == 0) {
                result.put("status", "success");
                result.put("message", "RVM模型训练完成");
                result.put("output", output.toString());
            } else {
                result.put("status", "error");
                result.put("message", "RVM模型训练失败");
                result.put("output", output.toString());
            }
        } catch (Exception e) {
            result.put("status", "error");
            result.put("message", "训练过程发生异常");
            result.put("error", e.getMessage());
        }
        return result;
    }
    
    public Map<String, Object> runCrossValidation(String dataPath) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 1. 准备数据
            List<VideoEvaluation> evaluations = evaluationRepository.findAll();
            if (evaluations.isEmpty()) {
                result.put("status", "error");
                result.put("message", "没有足够的评估数据");
                return result;
            }
            
            // 2. 调用Python脚本进行交叉验证
            ProcessBuilder pb = new ProcessBuilder(
                "python",
                PYTHON_SCRIPT,
                "--mode", "cross_validation",
                "--data", dataPath
            );
            
            Process process = pb.start();
            int exitCode = process.waitFor();
            
            if (exitCode != 0) {
                result.put("status", "error");
                result.put("message", "交叉验证失败");
                return result;
            }
            
            // 3. 读取结果
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream()))) {
                String output = reader.readLine();
                result.put("status", "success");
                result.put("message", "交叉验证完成");
                result.put("results", output);
            }
            
        } catch (Exception e) {
            log.error("Failed to run cross validation", e);
            result.put("status", "error");
            result.put("message", "交叉验证失败: " + e.getMessage());
        }
        
        return result;
    }
}
